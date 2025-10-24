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

export type PackageList = {
    name: string;
    profile: string;
    url: string;
    stats: string;
    list: string[];
    shields: string[];
    repos?: Record<string, string>;
}[];

export type PointsType = { name: string; coords: [number, number]; type: "place" }[];
