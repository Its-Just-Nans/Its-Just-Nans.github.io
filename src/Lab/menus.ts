import { writable } from "svelte/store";
import GithubIcon from "./GithubIcon.svelte";

export const menus = [
    // [
    //     {
    //         ico: null,
    //         link: "/lab/Waldo",
    //         title: "Waldo",
    //         subtitle: null,
    //     },
    // ],
    [
        {
            ico: null,
            link: "/lab/stats",
            title: "Stats",
            subtitle: null,
        },
    ],
    [
        {
            ico: null,
            link: "https://its-just-nans.github.io/function-viewer/",
            title: "Function viewer",
            subtitle: null,
        },
    ],
    [
        {
            ico: null,
            link: "/lab/CssEditor",
            title: "CSS Editor",
            subtitle: null,
        },
    ],
    [
        {
            ico: GithubIcon,
            link: "https://github.com/Its-Just-Nans",
            title: "Its-Just-Nans",
            subtitle: "",
        },
    ],
];

export const showMenu = writable(false);
