const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const fg = require('fast-glob');

module.exports = async function() {
  const input = './prebuild';

  fs.mkdirSync('./dist/');

  // function to get content of single file
  const readFile = function(file) {
    return new Promise((resolve, reject) => {
      fs.readFile(file.path, 'utf-8', (err, data) => {
        if(err) reject(err);
        let mod_data = data.replace(/\.\.\/images\//, './src/assets/images/');
        resolve({ data: mod_data, name: file.name });
      });
    });
  }
    
  let files = await fg(`${input}/*.html`);

  files = files.map(file => {
    return {
      relative_path: file,
      url: `file://${path.resolve(file)}`,
      name: file.replace(/.html/, '').slice(input.length+1)
    }
  });

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
      width: 1200,
      height: 627
    });

    for (const { url, name } of files) {
      await page.goto(url);
      await page.screenshot({
        path: `./dist/${name}.jpg`,
        type: 'jpeg',
        quality: 80 
      });
    }
  } catch (err) {
    console.log(err);
  } finally {
    return
    // if (browser !== undefined) {
    //   await browser.close();
    // }
  }
}
