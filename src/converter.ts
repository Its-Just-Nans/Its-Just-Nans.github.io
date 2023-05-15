import showdown from "showdown";
import showdownKatex from "showdown-katex";
import showdownHighlight from "showdown-highlight";

const converter = new showdown.Converter({
    openLinksInNewWindow: true,
    extensions: [
        showdownKatex({
            throwOnError: true,
            displayMode: false,
        }),
        showdownHighlight(),
    ],
});
converter.setFlavor("github");

export const convertMarkdown = (t: string) => {
    return converter.makeHtml(t);
};
