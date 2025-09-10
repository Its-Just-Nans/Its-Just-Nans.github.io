import type { MDXInstance } from "astro";
import { parse } from "path";

export const splitStringByLength = (inputString = "", chunkLength = 10) => {
    inputString = inputString || "";
    const words = inputString.split(" ");
    const result = [];

    let currentChunk = "";
    for (const word of words) {
        if ((currentChunk + word).length <= chunkLength) {
            currentChunk += (currentChunk === "" ? "" : " ") + word;
        } else {
            result.push(currentChunk);
            currentChunk = word;
        }
    }

    if (currentChunk !== "") {
        result.push(currentChunk);
    }

    return result;
};

export const slugify = (inputString = "") => {
    if (!inputString) {
        throw new Error("inputString is required");
    }
    const { name: inputName } = parse(inputString);
    return inputName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
};

export type FrontMatter = {
    title: string;
    description: string;
    hidden?: boolean;
    date: string;
    draft?: boolean;
    ico: string;
    slug: string;
    keywords: string[];
    tags: string[];
    toc?: boolean;
};

export type ArticleType = MDXInstance<FrontMatter>;

export const getAllArticles = () => {
    const articlesGlob = Object.values(import.meta.glob<ArticleType>("/website-articles/**/*.mdx", { eager: true }));
    const sortedArticles = articlesGlob.toSorted(
        (a, b) => getArticleDate(b.frontmatter).getTime() - getArticleDate(a.frontmatter).getTime()
    );
    const articlesDrafts = sortedArticles.filter(({ frontmatter: { title, draft } }) => {
        if (import.meta.env.DEV && draft) {
            console.log("Draft article:", title);
        }
        return draft;
    });
    const articles = sortedArticles.filter(({ frontmatter: { draft } }) => !draft);
    return { articles, articlesDrafts };
};

export const getItemsRSS = () => {
    const { articles } = getAllArticles();
    const nonHidden = articles.filter(({ frontmatter: { hidden } }) => !hidden);

    return nonHidden.map(({ frontmatter, url }) => {
        const { title, description = "", date } = frontmatter;
        const pubDate = date ? new Date(date) : new Date();
        const link = `/articles/${slugify(url)}`;
        return {
            title,
            pubDate,
            description,
            link,
        };
    });
};

export const getArticleDate = (frontmatter: FrontMatter) => {
    return new Date(frontmatter.date || new Date().toISOString());
};
