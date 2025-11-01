import type { PullRequest } from "@components/PullRequests/types";

import pullsUntyped from "@data/pull_requests/pulls.json";
import pullsNotGithubUntyped from "@data/pull_requests/not_github.json";

const pulls = pullsUntyped as Array<PullRequest>;
const pullsNotGithub = pullsNotGithubUntyped as Array<PullRequest>;

const allPulls = pulls.concat(pullsNotGithub);

export function GET() {
    return new Response(JSON.stringify(allPulls, null, 2));
}
