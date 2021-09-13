const Cache = require('@11ty/eleventy-cache-assets');
const slugify = require('slugify')

module.exports = async function() {

  // function to fetch content from storyblok
  const getStoryBlokContent = async function(query) {
    const baseUrl = 'https://api.storyblok.com/v2/cdn/stories';
    const url = `${baseUrl}?starts_with=${query}&token=${process.env.STORYBLOK_PUBLIC}`;
  
    // using cache function to store api queries for 1 day
    const response = await Cache(url, {
      duration: '1d',
      type: 'json'
    });

    return response
  }

  // config of available languages
  const languages = {
    default: {
      key: 'de',
      fetch_prefix: ''
    },
    en: {
      key: 'en',
      fetch_prefix: 'en/'
    }
  }

  // array of languages
  let arr_languages = Object.keys(languages);

  let pages_by_lang = arr_languages.map(async (_lang) => {
    // _lang is only the storyblok key of the lang (e.g. `default`)
    // to get the actual lang config, we have to use the _lang key on the languages object
    let lang = languages[_lang];
    // adding function to get content
    return getStoryBlokContent(`${lang.fetch_prefix}pages`);
  });

  // executing the fetch function for all languages using Promise.all
  pages_by_lang = await Promise.all(pages_by_lang);

  // flattening nested arrays. [[1, 2, 3], [4, 5]] becomes [1, 2, 3, 4, 5]
  let pages = pages_by_lang.map(page => page.stories).flat();

  // adding real lang keys (e.g. `de`) to each page object
  pages = pages.map(page => {
    const meta_tags = page.content.meta_tags[0];
    const lang = languages[page.lang].key;
    return {
      meta_tags,
      file: `${lang}-${slugify(meta_tags.title, { lower: true })}`,
      lang_key: lang
    }
  });

  // console.log(pages);
  return pages
}