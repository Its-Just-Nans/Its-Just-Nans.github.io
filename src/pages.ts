const nav = [
    {
        name: "About",
        route: "/",
    },
    {
        name: "Projects",
        route: "/projects",
    },
    {
        name: "History",
        route: "/history",
    },
    {
        name: "Articles",
        route: "/articles",
        func: (currentPath: URL, defaultRoute: string) => {
            if (currentPath.pathname === defaultRoute) {
                return "/articles/all";
            }
            return defaultRoute;
        },
    },
    {
        name: "Lab",
        route: "/lab",
    },
    {
        name: "Links",
        route: "/links",
    },
];

export default nav;
