import projects from "@data/projects/projects.json";

export function GET() {
    return new Response(JSON.stringify(projects, null, 2));
}
