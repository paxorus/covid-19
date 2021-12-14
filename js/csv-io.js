const Fs = require("fs");

function zip(A, B) {
	return A.map((row, idx) => [row, B[idx]]);
}

/**
 * Due to double and single quotes, we cannot just split the line on commas.
 */
function parseCsLine(line) {
	const pieces = [];
	let piece = [];
	let doubleQuoted = false;

	for (let i = 0; i < line.length; i ++) {
		// const previousCharacter = line.charAt(i - 1);
		const character = line.charAt(i);
		switch (character) {
			case "\"":
				// If value begins with a DQ, it's a DQed value.
				if (piece.length === 0) {
					doubleQuoted = true;
					break;
				}

				// If a value has a DQ anywhere else, it must be DQed, and either:
				// 1. It's a double DQ in the middle of the value, thus followed by a DQ.
				// 2. It's a closing DQ, at the end of the value, thus followed by a comma or end-of-string.
				if (doubleQuoted) {
					const nextCharacter = line.charAt(i + 1);
					// "b""bbb
					if (nextCharacter === "\"") {
						piece.push("\"");
						i += 1;
						break;
					}

					// "b"(EOS)
					if (nextCharacter === "") {
						doubleQuoted = false;
						break;
					}

					// "b",
					if (nextCharacter === ",") {
						doubleQuoted = false;
						pieces.push(piece.join(""));
						piece = [];
						i += 1;
						break;
					}

					// "b"b
					throw new Error(`Mismatched double quote in line <${line}>`);
				} else {
					// b"bb
					throw new Error(`Values that contain double quotes must be double-quoted, see line <${line}>`);
				}
				break;

			case ",":
				if (!doubleQuoted) {
					pieces.push(piece.join(""));
					piece = [];
				} else {
					piece.push(",");
				}
				break;

			default:
				piece.push(character);
		}
	}

	if (doubleQuoted) {
		throw new Error(`Double quote not closed in line <${line}>`);
	}

	// bbb, or bbb,bbb
	pieces.push(piece.join(""));

	return pieces;
}

/**
 * This differs from RFC-4180 in two minor ways:
 * 1. A double-quoted value cannot contain line breaks (span multiple lines).
 * 2. Extra values on a line are ignored.
 */
function readCsv(fileName) {
	// Trim to remove leading BOM (https://github.com/nodejs/node/issues/20649) and any \r if CSV typed on Windows.
	const fileLines = Fs.readFileSync(fileName, "utf8").split("\n");
	const headers = parseCsLine(fileLines.shift()).map(header => header.trim());

	// Allow trailing newline.
	if (fileLines[fileLines.length - 1] === "") {
		fileLines.pop();
	}

	// Trim to remove \r if CSV typed on Windows
	return fileLines.map(line => Object.fromEntries(zip(headers, parseCsLine(line.trim()))));
}

/**
 * This differs from RFC-4180 in one major way:
 * 1. It does not escape line breaks, commas, or double quotes with double quotes.
 * And one minor way:
 * 1. It ignores any extra values in a data record.
 */
function writeCsv(fileName) {
	const headers = Object.keys(this[0]).sort();
	const csRows = this.map(object => headers.map(header => object[header]).join(","));
	const headerLine = headers.join(",");
	Fs.writeFileSync(fileName, headerLine + "\n" + csRows.join("\n"));
};

module.exports = {
	parseCsLine,
	readCsv,
	writeCsv
};