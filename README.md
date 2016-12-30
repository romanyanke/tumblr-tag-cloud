# Tumblr Tag Cloud Generator

Generates a javascript file with all tags used in the given tumblr blog. Caches the result so it can be executed many times to update existing tag cloud with new tags.

##Prerequisites

- A tumblr application: https://www.tumblr.com/oauth/apps

##Setup

You have to define following environment variables

```
# authentication
TUMBLR_CONSUMER_KEY
TUMBLR_CONSUMER_SECRET
TUMBLR_TOKEN
TUMBLR_TOKEN_SECRET

# your blog name (*.tumblr.com)
TUMBLR_BLOG

# function name for jsonp (buildTumblrTagCloud by default)
TUMBLR_TAG_CALLBACK
```

`npm i && npm start` generates `./tag-cloud.js` that can be used for jsonp with following data:

```
buildTumblrTagCloud([
  {
    "tag": "some tag name",
    "count": 4
  },
  ...
])
```

##Usage

Publish generated `tag-cloud.js` as GitHub Pages and use it in your Tumblr theme like this:

```
<script>
  function buildTumblrTagCloud(tags) {
    document.querySelector('.tags').innerHTML = tags.map(function(data) {
      return `<a href="/tagged/${data.tag}">${data.tag} (${data.count})</a>`
    }).join('')
  }
</script>
<script src="https://romanyanke.github.io/tumblr-tag-cloud/tag-cloud.js"></script>
```
