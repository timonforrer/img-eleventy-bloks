const chromium = require('chrome-aws-lambda');
const path = require('path');
const fs = require('fs');
const fg = require('fast-glob');

module.exports = async function() {
  const input = './prebuild';

  if(!fs.existsSync('./dist/')) {
    fs.mkdirSync('./dist/');
  }

  // get all html files from folder
  let files = await fg(`${input}/*.html`);

  // exclude index file
  files = files.filter(fileName => fileName !== `${input}/index.html`);

  // process filenames and add info (name of file without suffix/path + file url for browser)
  files = files.map(file => {
    return {
      relative_path: file,
      name: file.replace(/.html/, '').slice(input.length+1),
      url: `file://${path.resolve(file)}`
    }
  });

  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: true
    });

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
