import History from "./History.svelte";
import Projects from "./Projects.svelte";
import About from "./About.svelte";
import Links from "./Links.svelte";

const jsonFetch = async (url) => {
    try {
        const resp = await fetch(url);
        return resp.json();
    } catch (e) { }
};

const nav = [
    {
        name: "About",
        route: "about",
        component: About,
        getData: async () => jsonFetch(`./data/languages.json`)
    },
    {
        name: "Projects",
        route: "projects",
        component: Projects,
        getData: async () => jsonFetch(`./data/projects.json`),
    },
    {
        name: "History",
        route: "history",
        component: History,
        getData: async () => jsonFetch(`./data/history.json`),
    },
    {
        name: "Links",
        route: "links",
        component: Links,
        getData: async () => jsonFetch(`./data/links.json`),
    }
];

export default nav;