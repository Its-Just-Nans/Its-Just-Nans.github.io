import pulls from "../../../Its-Just-Nans/data/pull_requests/pulls.json";
import NotGithub from "../../../Its-Just-Nans/data/pull_requests/not_github.json";
import type { PullRequest } from "@components/PullRequests/types";

const allPulls = (pulls as PullRequest[]).concat(NotGithub as PullRequest[]);

export function GET() {
    return new Response(JSON.stringify(allPulls, null, 2));
}
