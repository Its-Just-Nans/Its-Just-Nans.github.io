import History from "./History.svelte";
import Projects from "./Projects.svelte";
import About from "./About.svelte";
import Links from "./Links.svelte";

const jsonFetch = async (url) => {
    try {
        const resp = await fetch(url, {
            cache: "no-store"
        });
        return resp.json();
    } catch (e) { }
};

const nav = [
    {
        name: "About",
        route: "about",
        component: About,
        getData: async () => jsonFetch(`https://n4n5.dev/data/?file=languages.json`)
    },
    {
        name: "Projects",
        route: "projects",
        component: Projects,
        getData: async () => jsonFetch(`https://n4n5.dev/data/?file=projects.json`),
    },
    {
        name: "History",
        route: "history",
        component: History,
        getData: async () => jsonFetch(`https://n4n5.dev/data/?file=history.json`),
    },
    {
        name: "Links",
        route: "links",
        component: Links,
        getData: async () => jsonFetch(`https://n4n5.dev/data/?file=links.json`),
    }
];

export default nav;