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

type OnePackage = {
    name: string;
    profile: string;
    url: string;
    stats: string;
    list: Array<string>;
    shields: Array<string>;
    profile_urls?: Array<string>;
    repos?: Record<string, string>;
    urls?: Record<string, string>;
};

export type PackageList = Array<OnePackage>;

export type PointsType = Array<{ name: string; coords: [number, number]; type: "place" }>;
