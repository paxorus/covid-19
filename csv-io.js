const Fs = require('fs');

function zip(A, B) {
	return A.map((row, idx) => [row, B[idx]]);
}

function readCsv(fileName) {
	// Trim to remove leading BOM: https://github.com/nodejs/node/issues/20649
	const fileLines = Fs.readFileSync(fileName, 'utf8').trim().split("\n");
	const headers = fileLines.shift().split(",");

	return fileLines.map(line => Object.fromEntries(zip(headers, line.split(","))));
}

function writeCsv(fileName) {
	const headers = Object.keys(this[0]).sort();
	const csRows = this.map(object => headers.map(header => object[header]).join(","));
	const headerLine = headers.join(",");
	Fs.writeFileSync(fileName, headerLine + "\n" + csRows.join("\n"));
};

module.exports = {
	readCsv,
	writeCsv
};