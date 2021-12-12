const Fs = require('fs');
const {writeCsv} = require("./csv-io.js");

Array.prototype.writeCsv = writeCsv;
Array.prototype.writeJson = function (fileName) {
	Fs.writeFileSync(fileName, JSON.stringify(this, null, 4));
};

const identity = x => x;

Array.prototype.sum = function (keyFunc) {
	keyFunc = keyFunc || identity;
	return this.reduce((cumulative, row) => cumulative + keyFunc(row), 0);
};

Array.prototype.average = function (keyFunc) {
	keyFunc = keyFunc || identity;
	return this.sum(keyFunc) / this.length;
};

/**
 * Order of original objects is preserved.
 *
 * [{a: "MA", b: 10}, {a: "MA", b: 50}, {a: "NY", b: 20}]
 *   .groupBy(row => row.a)
 * 
 * yields:
 * [
 *   [ "MA", [
 *     {a: "MA", b: 10},
 *     {a: "MA", b: 50}
 *   ]],
 *   [ "NY", [
 *     {a: "NY", b: 20}
 *   ]]
 * ]
 */
Array.prototype.groupBy = function (keyFunc) {
	const keyMap = this.reduce(function (map, x) {
		const key = keyFunc(x);
		if (key in map) {
			map[key].push(x);
		} else {
			map[key] = [x];
		}
		return map;
	}, {});

	return Object.entries(keyMap);
};

/**
 * [{a: "MA", b: 10}, {a: "MA", b: 50}, {a: "NY", b: 20}]
 *   .innerJoin([{a: "MA", c: "Boston"}, {a: "NY", c: "Albany"}], ["a"], ["a"])
 * 
 * yields:
 * [
 *   { a: "MA", b: 10, c: "Boston" },
 *   { a: "MA", b: 50, c: "Boston" },
 *   { a: "NY", b: 20, c: "Albany" }
 * ]
 */
Array.prototype.innerJoin = function (B, AKeys, BKeys) {
	function createKeyFunc(keyNames) {
		return row => JSON.stringify(keyNames.map(keyName => row[keyName]));
	}

	const indexedA = this.groupBy(createKeyFunc(AKeys));
	const indexedB = Object.fromEntries(B.groupBy(createKeyFunc(BKeys)));

	return indexedA.flatMap(([AKey, AValueList]) => {
		if (AKey in indexedB) {
			const BValueList = indexedB[AKey];
			// Cross-join value lists.
			return AValueList.flatMap(AValue => BValueList.map(BValue => ({...AValue, ...BValue})));
		}

		return [];
	});
};
