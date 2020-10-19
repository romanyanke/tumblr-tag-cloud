"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../src/utils");
describe('normalizePathName', function () {
    it('should return dir and filename', function () {
        expect(utils_1.normalizePathName('./', 'file.json')).toEqual({
            dirname: '.',
            filename: 'file.json',
            path: 'file.json',
        });
        expect(utils_1.normalizePathName('foo/bar/', 'file.json')).toEqual({
            dirname: 'foo/bar',
            filename: 'file.json',
            path: 'foo/bar/file.json',
        });
    });
    it('should use json file name from path', function () {
        expect(utils_1.normalizePathName('./file.json', '')).toEqual({
            dirname: '.',
            filename: 'file.json',
            path: 'file.json',
        });
        expect(utils_1.normalizePathName('foo/bar/file.json', '')).toEqual({
            dirname: 'foo/bar',
            filename: 'file.json',
            path: 'foo/bar/file.json',
        });
    });
    it('should use json file name from fallback', function () {
        expect(utils_1.normalizePathName('bar', 'fallback.json')).toEqual({
            dirname: 'bar',
            filename: 'fallback.json',
            path: 'bar/fallback.json',
        });
        expect(utils_1.normalizePathName('bar', 'fallback')).toEqual({
            dirname: 'bar',
            filename: 'fallback.json',
            path: 'bar/fallback.json',
        });
    });
});
