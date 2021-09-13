const puppeteer = require('./src/puppeteer.js');

module.exports = function(config) {
  const debug = process.env.NODE_ENV === 'debug';

  config.addPassthroughCopy('./src/assets');

  if (!debug) {
    config.on('afterBuild', puppeteer);
  };


  return {
    dir: {
      data: 'data',
      input: 'src',
      // includes: 'components',
      layouts: 'layouts',
      output: debug ? 'dist' : 'prebuild'
    }
  }
}
