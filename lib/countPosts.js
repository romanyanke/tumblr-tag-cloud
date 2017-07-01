const { blogInfo } = require('./api')

module.exports = async () =>
  blogInfo()
    .then(data => data.blog.posts)
    .catch(err => console.error(err.message))
