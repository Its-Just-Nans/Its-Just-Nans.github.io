import packages from "../../../Its-Just-Nans/data/packages.json";

export function GET() {
    return new Response(JSON.stringify(packages, null, 2));
}
