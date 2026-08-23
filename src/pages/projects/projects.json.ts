import projects from "@data/github_projects.json";

export function GET() {
    return new Response(JSON.stringify(projects, null, 2));
}
