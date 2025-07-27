import links from "@data/links/links.json";
import subdomains from "@data/subdomains.json";

const linksData = {
    links: links,
    subdomains: subdomains,
};

export function GET() {
    return new Response(JSON.stringify(linksData, null, 2));
}
