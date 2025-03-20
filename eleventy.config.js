import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import { EleventyHtmlBasePlugin, InputPathToUrlTransformPlugin, IdAttributePlugin} from "@11ty/eleventy";

import markdownIt from "markdown-it";
import mdAttrs from "markdown-it-attrs";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {

    // Picking which files to use in our blog
    eleventyConfig.addPassthroughCopy({
        "./public/": "/"
    });
    eleventyConfig.addPreprocessor("drafts", "njk,md,liquid", (data, content) => {
		if(data.draft) {
			return false;
		}
	});

    // Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets
    eleventyConfig.addWatchTarget("blog/**/*.{svg,webp,png,jpg,jpeg,gif}");


    // Official Plugins
    eleventyConfig.addPlugin(syntaxHighlight, {
		preAttributes: { tabindex: 0 }
	});
    // Image optimization: https://www.11ty.dev/docs/plugins/image/#eleventy-transform
    eleventyConfig.addPlugin(eleventyImageTransformPlugin);
    // https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix
    // used in combintation with --pathprefix when deploying in prod
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
    // https://www.11ty.dev/docs/plugins/inputpath-to-url/
    eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);
    // https://www.11ty.dev/docs/plugins/id-attribute/
    eleventyConfig.addPlugin(IdAttributePlugin);


    // markdown things
    let options = {
		html: true,
		breaks: true,
		linkify: true,
	};
	eleventyConfig.setLibrary("md", markdownIt(options));
    eleventyConfig.amendLibrary("md", (mdLib) => mdLib.enable("code"));
    eleventyConfig.amendLibrary("md", (mdLib) => mdLib.use(mdAttrs));

   
    // Custom Filters
    eleventyConfig.addFilter("filterByCategory", (posts, cat) => {
        return posts.filter(p => p.data.categories.includes(cat));
    });

    eleventyConfig.addCollection("categories", collectionApi => {
        let categories = new Set();
        let posts = collectionApi.getFilteredByTag("post");
        posts.forEach(element => {
            element.data.categories.forEach(c => categories.add(c));
        });
        return Array.from(categories);
    });

    eleventyConfig.addShortcode("formatDate", date => {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          });
    })
    return {
        dir: {
            input: "content",          
            includes: "../_includes", // (relative to input)
            data: "../_data",         // (relative to input)
        }
    }
};

