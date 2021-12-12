const assert = require("assert");
require("../array-monkey-patch.js");

describe("Array Monkey Patch module", () => {
    describe("#groupBy()", () => {
        it("groups by state", () => {
            const input = [{a: "MA", b: 10}, {a: "MA", b: 50}, {a: "NY", b: 20}];
            const actual = input.groupBy(row => row.a);

            const expected =  [
                [ "MA", [
                    {a: "MA", b: 10},
                    {a: "MA", b: 50}
                ]],
                [ "NY", [
                    {a: "NY", b: 20}
                ]]
            ];

            assert.deepEqual(actual, expected);
        });
    });

    describe("#innerJoin()", () => {
        it("joins by the given left and right keys", () => {
            const actual = [{a: "MA", b: 10}, {a: "MA", b: 50}, {a: "NY", b: 20}]
                .innerJoin([{d: "MA", c: "Boston"}, {d: "NY", c: "Albany"}], ["a"], ["d"]);

            const expected =  [
                { a: "MA", b: 10, c: "Boston", d: "MA" },
                { a: "MA", b: 50, c: "Boston", d: "MA" },
                { a: "NY", b: 20, c: "Albany", d: "NY" }
            ];

            assert.deepEqual(actual, expected);
        });

        it("excludes unmatched rows from the left and right lists", () => {
            const actual = [{a: "MA", b: 10}, {a: "WA", b: 50}, {a: "NY", b: 20}]
                .innerJoin([{a: "MA", c: "Boston"}, {a: "NY", c: "Albany"}, {d: "CA", c: "Sacramento"}], ["a"], ["a"]);

            const expected =  [
                { a: "MA", b: 10, c: "Boston" },
                { a: "NY", b: 20, c: "Albany" }
            ];

            assert.deepEqual(actual, expected);
        });
    });

});
