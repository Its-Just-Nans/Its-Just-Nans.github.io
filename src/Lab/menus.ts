import { writable } from "svelte/store";
import GithubIcon from "./GithubIcon.svelte";

export const menus = [
    [
        {
            ico: null,
            link: null,
            title: "Undo",
            subtitle: "CTRL+Z",
        },
    ],
    [
        {
            ico: null,
            link: "/lab/CssEditor",
            title: "CSS Editor",
            subtitle: "",
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
