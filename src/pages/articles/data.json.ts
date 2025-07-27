import { getItemsRSS } from "../../components/utils";

const articles = getItemsRSS();

export function GET() {
    return new Response(JSON.stringify(articles, null, 2));
}
