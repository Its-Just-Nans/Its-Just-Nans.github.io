const nav = [
    {
        name: "Home",
        route: "/",
    },
    {
        name: "Projects",
        route: "/projects/",
    },
    {
        name: "Articles",
        route: "/articles/",
    },
    {
        name: "Links",
        route: "/links/",
    },
];

export default nav;

export const pseudo = "n4n5";
export const website = `${pseudo}.dev`;
export const websiteUrl = `https://${website}`;

// external links
export const githubStats =
    "https://n4n5.dev/can-be-useful/svelte-github-stats/";

export const packageLink = "https://packages.n4n5.dev/";

export const CLEANER = [
    "https://github.com/Its-Just-Nans",
    "https://github.com/Bel-Art",
];

export const schoolChecker = ["DUT R&T", "TP"];

const hiddenRepos = [
    "whatisthis",
    "sms2call",
    "svelte-number-displayer",
    "svg-packages-stats",
    "plugin-astro-content",
    "go-calendar",
    // "spust",
    // "sudoku-solver",
    "astro-index",
    "astro-barchart",
    "astro-simple-carousel",
    "bladvak",
    "csv-to-custom-json-python",
    "static-sitemap",
    "cors-proxy",
    "porygon",
    "deploy-that",
];

export const filterProjects = (repo: {
    name: string;
    description: string | null;
    archivedAt: string | null;
}) => {
    const name = repo.name;
    if (!repo.description) {
        console.log(`Project '${name}' doesn't have description !!`);
        return false;
    }
    if (repo.description.startsWith("🌐")) {
        console.log(`Project is starting with 🌐: '${name}'`);
        return false;
    }
    if (repo.archivedAt) {
        console.log(`Project is archived: '${name}'`);
        // return false;
    }
    if (hiddenRepos.includes(name)) {
        console.log(`Project is now-archived: '${name}'`);
        repo.archivedAt = "now"; // little hack
    }
    return true;
};
