import type { PullRequest } from "@components/PullRequests/types";

import pullsUntyped from "@data/github_pulls_requests.json";
import pullsNotGithubUntyped from "@data/other_pulls_requests.json";

const pulls = pullsUntyped as Array<PullRequest>;
const pullsNotGithub = pullsNotGithubUntyped as Array<PullRequest>;

const allPulls = pulls.concat(pullsNotGithub);

export function GET() {
    return new Response(JSON.stringify(allPulls, null, 2));
}
