import languages from "@components/LanguagesList/languages.json";

export function GET() {
    return new Response(JSON.stringify(languages, null, 2));
}
