# DEPRECATED
# You better use [tumblr-tags](https://www.npmjs.com/package/tumblr-tags) now

# Tumblr Tag Cloud

Generates a JSON file (and optionally `.js` file for JSONP) with all tags used in the tumblr blog. Caches the result so script can be executed many times to update existing tag cloud with new tags.

## Tag cloud structure

```
[
  {
    tag: "travel",
    count: 4
  },
  {
    tag: "vacation",
    count: 3
  },
  ...
]
```

## Usage and deployment

You have to publish generated files somewhere. I suggest to use `gh-pages` so you can fetch JSON with tags or include `.js` file into your Tumblr theme to use it as JSONP like this:

```
<script>
  function buildTumblrTagCloud(tags) {
    document.querySelector('.tags').innerHTML = tags.map(data => {
      return `<a href="/tagged/${data.tag}">${data.tag} (${data.count})</a>`
    }).join(', ')
  }
</script>
<script src="https://romanyanke.github.io/tumblr-tag-cloud/cloud.js"></script>
```

__NPM Commands__

* `npm start` generates files in `dist/` folder and caches the result in `./cache.json` file. Run it again and it updates your cloud with new tags.
* `npm run deploy` uses `gh-pages` to publish the files in the `dist/` directory.
* `npm run update` runs both command.

__File structure__

```
tumblr-tag-cloud/
├── dist/
│   ├── cloud.json
│   └── cloud.js
├── cache.json
└── tumblr-cloud.config.js
```

## Prerequisites

* [A Tumblr application](https://www.tumblr.com/oauth/apps) for API requests.

## Configuration

You can define the environment variables and/or create in the root `tumblr-cloud.config.js` with the same parameters. The config file parameters will override the environment parameters.
All variables are required except callback function name and skip-json-file flag.

| Variable             | Description |
| -------------------- | ----------- |
|TUMBLR_CONSUMER_KEY   |Tumblr application consumer key|
|TUMBLR_CONSUMER_SECRET|Tumblr application consumer secret|
|TUMBLR_TOKEN          |Tumblr application token|
|TUMBLR_TOKEN_SECRET   |Tumblr application token secret|
|TUMBLR_BLOG           |The part of the blog address before `.tumblr.com`|
|TUMBLR_CALLBACK       |_Optional_ will generate `dist/jsonp.js` file for JSONP with provided name of the function|
|TUMBLR_SKIP_JSON      |_Optional_ will NOT generate default `json` file|

__tumblr-cloud.config.js example__

```
module.exports = {
  TUMBLR_BLOG: 'me-yanke',
  TUMBLR_SKIP_JSON: true,
  TUMBLR_CALLBACK: 'buildTumblrTagCloud'
}

```
