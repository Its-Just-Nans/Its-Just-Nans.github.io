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
        func: (currentPath: URL, defaultRoute: string) => {
            if (currentPath.pathname === defaultRoute) {
                return "/articles/all/";
            }
            return defaultRoute;
        },
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
export const githubStats = "https://n4n5.dev/can-be-useful/svelte-github-stats/";

export const packageLink = "https://packages.n4n5.dev/";