const ProgressBar = require('progress');

module.exports = total => {
  const mask = '[:bar] :current/:total'
  const bar = new ProgressBar(mask, {
    total,
    width: 40,
    incomplete: '.'
  })

  return bar
}
