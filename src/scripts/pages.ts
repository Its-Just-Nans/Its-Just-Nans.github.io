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
];

export const filterRepo = (
  name: string,
  description: string,
  archivedAt: string | null,
) => {
  if (description.startsWith("🌐")) {
    console.log(`Project is starting with 🌐: '${name}'`);
    return false;
  }
  if (hiddenRepos.includes(name)) {
    return false;
  }
  if (archivedAt) {
    console.log(`Project is archived: '${name}'`);
    return false;
  }
  return true;
};
