export interface PullRequest {
    node: RepoNode;
}

export interface RepoNode {
    id: string;
    number: number;
    title: string;
    url: string;
    state: string;
    createdAt: string;
    baseRepository: {
        url: string;
        name: string;
        description: string;
        owner: {
            login: string;
        };
        languages: {
            nodes?: Array<{
                name: string;
            }> | null;
        };
    };
}
