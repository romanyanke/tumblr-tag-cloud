"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePathName = void 0;
var path_1 = __importDefault(require("path"));
exports.normalizePathName = function (pathname, fileNameFallback) {
    var _a = path_1.default.parse(pathname), ext = _a.ext, dir = _a.dir, base = _a.base;
    var jsonExt = '.json';
    var isJSON = ext === jsonExt;
    var filename = isJSON ? base : path_1.default.parse(fileNameFallback).name + jsonExt;
    var dirname = isJSON ? dir : path_1.default.join(dir, base);
    return { dirname: dirname, filename: filename, path: path_1.default.join(dirname, filename) };
};
