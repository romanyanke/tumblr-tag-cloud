"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cache_1 = require("../src/cache");
describe('getNextRecordValue', function () {
    it('should retrun next index', function () {
        expect(cache_1.getNextRecordValue({ foo: 100 })).toEqual(101);
        expect(cache_1.getNextRecordValue({ one: 1, two: 2 })).toEqual(3);
        expect(cache_1.getNextRecordValue({ one: 1, two: 2, ten: 10 })).toEqual(11);
    });
    it('should retrun 0 if list is empty', function () {
        expect(cache_1.getNextRecordValue({})).toEqual(0);
    });
});
