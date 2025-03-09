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

export const sortByDate = (a: MDXInstance<Record<string, any>>, b: MDXInstance<Record<string, any>>) => {
    const dateOneStart = new Date(a.frontmatter.date1 || a.frontmatter.date_start);
    const dateOneEnd =
        a.frontmatter.date2 || a.frontmatter.date_end
            ? new Date(a.frontmatter.date2 || a.frontmatter.date_end)
            : dateOneStart;
    const dateTwoStart = new Date(b.frontmatter.date1 || b.frontmatter.date_start);
    const dateTwoEnd =
        b.frontmatter.date2 || b.frontmatter.date_end
            ? new Date(b.frontmatter.date2 || b.frontmatter.date_end)
            : dateTwoStart;
    // little checkup
    if (dateOneStart > dateOneEnd) {
        throw new Error(`${a.frontmatter.title}: date1 is bigger than date2`);
    }
    if (dateTwoStart > dateTwoEnd) {
        throw new Error(`${b.frontmatter.title}: date1 is bigger than date2`);
    }
    const d1 = (dateOneStart.getTime() + dateOneEnd.getTime()) / 2 + dateOneEnd.getTime() * 2;
    const d2 = (dateTwoEnd.getTime() + dateTwoEnd.getTime()) / 2 + dateTwoEnd.getTime() * 2;
    if (d1 > d2) {
        return -1;
    }
    if (d1 < d2) {
        return 1;
    }
    return 0;
};

type GetHistoryProps = {
    txts: MDXInstance<Record<string, any>>[];
    icons: Record<string, any>[];
};

export const getAllHistory = async ({ icons: images = [], txts = [] }: GetHistoryProps) => {
    const historyAll = txts
        .map(({ frontmatter, ...rest }) => {
            const ico = frontmatter.ico
                ? images.find(
                      (oneImg) =>
                          oneImg.src.split("/").pop().split(".").shift() ===
                          frontmatter.ico.split("/").pop().split(".").shift()
                  ) || { src: "" }
                : { src: "" };
            return {
                frontmatter: { ...frontmatter, ico: ico.src, draft: frontmatter.draft || false },
                ico: ico.src || "",
                ...rest,
            };
        })
        .sort(sortByDate);
    const historyDrafts = historyAll.filter(({ frontmatter: { draft } }) => draft);
    const history = historyAll.filter(({ frontmatter: { draft } }) => !draft);
    return { history, historyDrafts };
};

export type FrontMatter = {
    title: string;
    description: string;
    hidden?: boolean;
    date: string;
    draft?: boolean;
    date1?: string;
    date2?: string;
    ico: string;
    slug: string;
    keywords: string[];
    toc?: boolean;
};

export type ArticleType = MDXInstance<FrontMatter>;

export const getAllArticles = () => {
    const articlesGlob = Object.values(import.meta.glob<ArticleType>("/website-articles/**/*.mdx", { eager: true }));
    const sortedArticles = articlesGlob.toSorted(
        (a, b) =>
            new Date(b.frontmatter?.date || new Date()).getTime() -
            new Date(a.frontmatter?.date || new Date()).getTime()
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
