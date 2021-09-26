const puppeteer = require('./src/puppeteer.js');
const path = require('path');

module.exports = function(config) {
  const debug = process.env.NODE_ENV === 'debug';

  config.addPassthroughCopy('./src/assets');

  if (!debug) {
    config.on('afterBuild', puppeteer);
  };

  config.addFilter('toFullPath', input => {
    if (process.env.NODE_ENV !== 'debug') {
      return path.resolve(`src/${input}`)
    } else {
      return input
    }
  });

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
