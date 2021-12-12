const assert = require("assert");
const {movingAverage} = require("../moving-average.js");

describe("Moving Average module", () => {
	describe("#movingAverage()", () => {
		it("aggregates windows when windows overlap", () => {
			const input = [{a: "CA", b: 50, c: 20}, {a: "MA", b: 10, c: 21}, {a: "NY", b: 20, c: 19}];
			const actual = movingAverage({data: input, x: "b", y: "c", windowWidth: 20, stepWidth: 10, logarithmic: false});

			const expected =  [
				{
					b: 20,
					b_window: [10, 30],
					c: 20,
					n: 2
				},            	
				{
					b: 30,
					b_window: [20, 40],
					c: 19,
					n: 1
				},
				{
					b: 40,
					b_window: [30, 50],
					c: 20,
					n: 1
				}
			];

			assert.deepEqual(actual, expected);
		});

		it("aggregates windows when windows don't overlap", () => {
			const input = [{a: "CA", b: 50, c: 20}, {a: "MA", b: 10, c: 21}, {a: "NY", b: 20, c: 19}];
			const actual = movingAverage({data: input, x: "b", y: "c", windowWidth: 20, stepWidth: 20, logarithmic: false});

			const expected =  [
				{
					b: 20,
					b_window: [10, 30],
					c: 20,
					n: 2
				},
				{
					b: 40,
					b_window: [30, 50],
					c: 20,
					n: 1
				}
			];

			assert.deepEqual(actual, expected);
		});
	});
});