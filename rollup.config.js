import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import css from "rollup-plugin-css-only";
import fs from "fs";
import path from "path";
import CleanCSS from 'clean-css';
import UglifyJS from "uglify-js";

const production = !process.env.ROLLUP_WATCH;

const pathToCSS = path.join(__dirname, "css");
const pathToJS = path.join(__dirname, "js");

const getCSSandJS = () => {
    const listOfCSS = fs.readdirSync(pathToCSS);
    let cssToAdd = "";
    for (const oneCSS of listOfCSS) {
        const correctPath = path.join(pathToCSS, oneCSS)
        cssToAdd += " " + fs.readFileSync(correctPath).toString();
    }
    var output = new CleanCSS().minify(cssToAdd);
    const index = fs.readFileSync("index.template.html").toString();
    const listOfJS = fs.readdirSync(pathToJS).map((el) => {
        const a = path.join(pathToJS, el)
        const js = UglifyJS.minify(fs.readFileSync(a).toString()).code;
        return js;
    });
    let final = index.replace(/\/\/script/, listOfJS.reduce((prev, current) => {
        return prev + " " + current;
    }));
    fs.writeFileSync("index.html", final);
    return output.styles || "";
}

export default {
    input: "src/main.js",
    output: {
        sourcemap: true,
        format: "iife",
        name: "app",
        file: "bundle.js",
    },
    plugins: [
        svelte({
            preprocess: sveltePreprocess({ sourceMap: !production }),
            preprocess: sveltePreprocess({ sourceMap: !production }),
            compilerOptions: {
                // enable run-time checks when not in production
                dev: !production,
            },
        }),
        // we'll extract any component CSS out into
        // a separate file - better for performance
        css({
            output: (styles) => {
                let output = getCSSandJS();
                fs.writeFileSync("bundle.css", output + " " + styles);
            }
        }),

        // If you have external dependencies installed from
        // npm, you'll most likely need these plugins. In
        // some cases you'll need additional configuration -
        // consult the documentation for details:
        // https://github.com/rollup/plugins/tree/master/packages/commonjs
        resolve({
            browser: true,
            dedupe: ["svelte"],
        }),
        commonjs(),

        // If we're building for production (npm run build
        // instead of npm run dev), minify
        production && terser(),
    ],
    watch: {
        clearScreen: false,
    },
};
