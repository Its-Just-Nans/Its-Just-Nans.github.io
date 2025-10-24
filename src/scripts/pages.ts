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
    // {
    //     name: "Lab",
    //     route: "/lab/",
    // },
    {
        name: "Links",
        route: "/links/",
    },
];

export default nav;

export const pseudo = "n4n5";
export const website = `${pseudo}.dev`;
export const websiteUrl = `https://${website}`;
