const assert = require("assert");
const {parseCsLine} = require("../csv-io.js");

describe("Csv IO module", function() {
    describe("#parseCsLine()", function() {
        it("parses an empty line as one empty value", function() {
            assert.deepEqual(parseCsLine(""), [""]);
        });

        it("parses one value as one value", function() {
            assert.deepEqual(parseCsLine("aaa"), ["aaa"]);
        });

        it("parses comma-separated values as many values", function() {
            assert.deepEqual(parseCsLine("aaa,bbb,ccc"), ["aaa", "bbb", "ccc"]);
        });

        it("parses a trailing comma as one empty string value", function() {
            assert.deepEqual(parseCsLine("aaa,bbb,ccc,"), ["aaa", "bbb", "ccc", ""]);
        });

        it("parses double-quoted values", function() {
            assert.deepEqual(parseCsLine(`"aaa","bbb","ccc"`), ["aaa", "bbb", "ccc"]);
        });

        it("parses two double quotes as an escaped double quote", function() {
            assert.deepEqual(parseCsLine(`"aaa","b""bb","ccc"`), ["aaa", `b"bb`, "ccc"]);
        });

        it("throws on mismatched a double quote", function() {
            assert.throws(() => parseCsLine(`"aaa","b"bb","ccc"`), {
                name: "Error",
                message: `Mismatched double quote in line <"aaa","b"bb","ccc">`
            });
        });

        it("throws on a double quote in a non-double-quoted value", function() {
            assert.throws(() => parseCsLine(`b"bb`), {
                name: "Error",
                message: `Values that contain double quotes must be double-quoted, see line <b"bb>`
            });
        });

        it("parses an escaped comma", function() {
            assert.deepEqual(parseCsLine(`"aaa","b,bb","ccc"`), ["aaa", "b,bb", "ccc"]);
        });

        it("throws on unmatched closing quotes", function() {
            assert.throws(() => parseCsLine(`"aaa",bb"`), {
                name: "Error",
                message: `Values that contain double quotes must be double-quoted, see line <"aaa",bb">`
            });
        });

        it("throws on unmatched middle quotes", function() {
            assert.throws(() => parseCsLine(`"aaa",bb"b`), {
                name: "Error",
                message: `Values that contain double quotes must be double-quoted, see line <"aaa",bb"b>`
            });
        });

        it("throws on unmatched opening quotes", function() {
            assert.throws(() => parseCsLine(`"aaa","bbb`), {
                name: "Error",
                message: `Double quote not closed in line <"aaa","bbb>`
            });
        });

        it("throws on single double quote as a value", function() {
            assert.throws(() => parseCsLine(`"aaa",",bbb`), {
                name: "Error",
                message: `Double quote not closed in line <"aaa",",bbb>`
            });
        });
    });
});
