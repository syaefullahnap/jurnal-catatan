// ============================================
// Eleventy config for Jurnal & Catatan
// ============================================

const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");
const md = markdownIt({ html: true, linkify: true, typographer: true });

module.exports = function (eleventyConfig) {
  // ----- Pass-through copies -----
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });
  eleventyConfig.addPassthroughCopy({ "src/_headers": "_headers" });

  // ----- Filters -----
  eleventyConfig.addFilter("readableDate", (dateObj, format = "d MMMM yyyy", zone = "Asia/Jakarta") => {
    if (!dateObj) return "";
    return DateTime.fromJSDate(new Date(dateObj), { zone }).toFormat(format);
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    if (!dateObj) return "";
    return DateTime.fromJSDate(new Date(dateObj), { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  eleventyConfig.addFilter("dateToRfc3339", (dateObj) => {
    if (!dateObj) return "";
    return DateTime.fromJSDate(new Date(dateObj), { zone: "utc" }).toISO();
  });

  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));

  eleventyConfig.addFilter("categoryLabel", (cat) => {
    const map = {
      "perjalanan": "Jurnal Perjalanan",
      "kehidupan": "Jurnal Kehidupan",
      "pribadi": "Tulisan Pribadi",
      "travel": "Perjalanan",
      "life": "Kehidupan",
      "writing": "Tulisan",
    };
    return map[cat] || cat;
  });

  eleventyConfig.addFilter("categoryUrl", (cat) => {
    const map = {
      "perjalanan": "/jurnal-perjalanan/",
      "kehidupan": "/jurnal-kehidupan/",
      "pribadi": "/tulisan-pribadi/",
      "travel": "/jurnal-perjalanan/",
      "life": "/jurnal-kehidupan/",
      "writing": "/tulisan-pribadi/",
    };
    return map[cat] || "/";
  });

  // ----- Collections -----
  eleventyConfig.addCollection("posts", (api) => {
    return api
      .getFilteredByGlob("src/content/**/*.md")
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  });

  eleventyConfig.addCollection("perjalanan", (api) => {
    return api
      .getFilteredByGlob("src/content/perjalanan/*.md")
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  });

  eleventyConfig.addCollection("kehidupan", (api) => {
    return api
      .getFilteredByGlob("src/content/kehidupan/*.md")
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  });

  eleventyConfig.addCollection("pribadi", (api) => {
    return api
      .getFilteredByGlob("src/content/pribadi/*.md")
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  });

  eleventyConfig.addCollection("latestPosts", (api) => {
    return api
      .getFilteredByGlob("src/content/**/*.md")
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date))
      .slice(0, 6);
  });

  // ----- Shortcodes -----
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  return {
    dir: {
      input: "src",
      output: "_site",
      data: "_data",
      includes: "_includes",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
