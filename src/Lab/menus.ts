import { writable } from "svelte/store";
import GithubIcon from "./GithubIcon.svelte";

export const menus = [
    [
        {
            ico: null,
            link: "/lab/css-editor",
            title: "CSS Editor",
            subtitle: null,
        },
        {
            ico: null,
            link: "/lab/pack-your-bag",
            title: "Pack your bag",
            subtitle: null,
        },
        {
            ico: null,
            link: "/lab/time-based-animation",
            title: "Time based animation",
            subtitle: null,
        },
    ],
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
        {
            ico: null,
            link: "/lab/packages",
            title: "Packages",
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
            ico: GithubIcon,
            link: "https://github.com/Its-Just-Nans",
            title: "Its-Just-Nans",
            subtitle: "",
        },
    ],
];

export const showMenu = writable(false);
