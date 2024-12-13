export type SingleProject = {
    name: string;
    url: string;
    description: string;
    stargazerCount: number;
    homepageUrl: string;
    primaryLanguage?: {
        name: string;
        color: string;
    };
};
