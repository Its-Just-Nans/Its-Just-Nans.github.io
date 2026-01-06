import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

export const downloadScript = async (files: { [ke: string]: string }) => {
    const outputPublicDir = "public/downloaded";
    Object.entries(files).map(async ([url, output]) => {
        const outputDir = join(outputPublicDir, dirname(output));
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir);
        }
        const outputFile = join(outputDir, basename(output));
        if (!existsSync(outputFile)) {
            const file = await fetch(url).catch((e) => {
                throw e;
            });
            const content = await file.arrayBuffer().catch((e) => {
                throw e;
            });
            writeFileSync(outputFile, Buffer.from(content));
        }
    });
};

const getRandomColor = function () {
    const h = Math.floor(Math.random() * 360);
    return `hsl(${h}, 70%, 50%)`;
};

export const globalColor = getRandomColor();