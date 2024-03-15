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
    const lastPart = inputString.includes("/") ? inputString.split("/") : [inputString];
    const filenameExt = lastPart.pop();
    if (!filenameExt) {
        throw new Error("filename is required");
    }
    const filename = filenameExt.split(".").shift();
    return filename?.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
};

export const sortByDate = (a, b) => {
    const d1a = new Date(a.frontmatter.date1);
    const d1b = new Date(a.frontmatter.date2);
    const d2a = new Date(b.frontmatter.date1);
    const d2b = new Date(b.frontmatter.date2);
    // little checkup
    if (d1a > d1b) {
        throw new Error(`${a.frontmatter.title}: date1 is bigger than date2`);
    }
    if (d2a > d2b) {
        throw new Error(`${b.frontmatter.title}: date1 is bigger than date2`);
    }
    const d1 = a.frontmatter.date2 ? d1b : d1a;
    const d2 = b.frontmatter.date2 ? d2b : d2a;
    if (d1 > d2) {
        return -1;
    }
    if (d1 < d2) {
        return 1;
    }
    return 0;
};

export const getAllHistory = async ({ icons: images = [], txts = [] }) => {
    const historyAll = txts
        .map(({ frontmatter, Content, file, url }) => {
            let correctIcoLink;
            const ico = frontmatter.ico;
            if (ico) {
                correctIcoLink = images.find(
                    (oneImg) =>
                        oneImg.src.split("/").pop().split(".").shift() === ico.split("/").pop().split(".").shift()
                );
            }
            return { frontmatter: frontmatter, Content: Content, ico: correctIcoLink?.src || "", file, url };
        })
        .sort(sortByDate);
    const historyDrafts = historyAll.filter(({ frontmatter: { draft } }) => draft);
    const history = historyAll.filter(({ frontmatter: { draft } }) => !draft);
    return { history, historyDrafts };
};

export const getAllArticles = (articlesGlob = []) => {
    const sortedArticles = articlesGlob.sort(
        (a, b) =>
            new Date(b.frontmatter?.date || new Date()).getTime() -
            new Date(a.frontmatter?.date || new Date()).getTime()
    );
    const articlesDrafts = sortedArticles.filter(({ frontmatter: { draft } }) => draft);
    const articles = sortedArticles.filter(({ frontmatter: { draft } }) => !draft);
    return { articles, articlesDrafts };
};
