"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCache = exports.getNextRecordValue = void 0;
var getEmptyCache = function () { return ({
    postProcessed: 0,
    posts: {},
    tags: {},
}); };
exports.getNextRecordValue = function (record) {
    var values = Object.values(record).sort(function (a, b) { return a - b; });
    var lastValue = values[values.length - 1];
    return lastValue ? lastValue + 1 : 0;
};
exports.processCache = function (inputCache) {
    if (inputCache === void 0) { inputCache = getEmptyCache(); }
    var cache = __assign({}, inputCache);
    var addPostTag = function (postId, tag) {
        if (!cache.tags[tag]) {
            cache.tags[tag] = exports.getNextRecordValue(cache.tags);
        }
        if (!cache.posts[postId]) {
            cache.posts[postId] = [];
        }
        var tagId = cache.tags[tag];
        cache.posts[postId].push(tagId);
        cache.postProcessed += 1;
    };
    var addTags = function (post) {
        return post.tags.map(function (tag) { return addPostTag(post.id, tag); });
    };
    var getCache = function () { return cache; };
    return {
        addTags: addTags,
        getCache: getCache,
    };
};
