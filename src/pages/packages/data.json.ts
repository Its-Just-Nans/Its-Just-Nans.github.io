import packages from "@data/packages.json";

export function GET() {
    return new Response(JSON.stringify(packages, null, 2));
}
