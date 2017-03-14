//
// trends_test.js
//
// Copyright (c) 2016-2017 Junpei Kawamoto
//
// This software is released under the MIT License.
//
// http://opensource.org/licenses/mit-license.php
//
const {
    assert
} = require("chai");

const trends = require("../lib/trends");

describe("Trends function", function() {
    this.timeout(60 * 1000);

    it("Returns about fifty video IDs in Japanese trend page", () => {
        return trends("JP").then((res) => {
            assert.isAtLeast(res.length, 1, "There is at least one video IDs.");
            assert.isAtMost(res.length, 50, "Trend video page has at most 50 videos.")
        });
    });

    it("Returns about fifty video IDs in English trend page", () => {
        return trends("EN").then((res) => {
            assert.isAtLeast(res.length, 1, "There is at least one video IDs.");
            assert.isAtMost(res.length, 50, "Trend video page has at most 50 videos.")
        });
    });

});
