const images = Object.values(import.meta.glob("./*.jpg", { eager: true, query: "?url", import: "default" }));

import data from "./data.json";

export const waldoData = data;
export const waldoImgs = images;
