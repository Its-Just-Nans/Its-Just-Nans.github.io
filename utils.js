import axios from 'axios';
import fs from 'fs';
import process from 'process';

let data = JSON.parse(fs.readFileSync("./data/projects.json"));

console.log("Getting data...")

process.on('uncaughtException', (err, origin) => {
    console.error('Uncaught Exception origin ->', origin);
    console.error('Uncaught Exception err ->', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection promise ->', promise);
    console.error('Unhandled rejection reason  ->', reason);
});

const rq = async (url) => {
    let dataAxios = { data: [] };
    try {
        dataAxios = await axios.get(url)
    } catch (e) {
        console.log(e.response.data.message);
        e;
    }
    return dataAxios;
}


const names = {
    "Its-Just-Nans": true
};

const user = "Its-Just-Nans"

const getGitHubData = async () => {
    const colors = (await rq("https://raw.githubusercontent.com/ozh/github-colors/master/colors.json")).data;
    const url = "https://api.github.com/users/Its-Just-Nans/repos"
    const githubData = await rq(url);
    addToData(githubData.data);
    const urlGists = "https://api.github.com/users/its-just-nans/gists";
    const dataGist = await rq(urlGists);
    addToData(dataGist.data);
    data = data.filter((obj) => {
        if (obj.fork) {
            return false;
        }
        if (names[obj.name]) {
            return false
        }
        return true;
    })
    data = data.map(({ url, name, html_url, description, stargazers_count, homepage, lang, lang_color }) => {
        return { url, type: url.startsWith("https://api.github.com/repos") ? "repo" : "gist", name, html_url, description, stargazers_count, homepage, lang, lang_color }
    });
    for (const [i, repo] of data.entries()) {
        const request = await rq(`https://api.github.com/repos/${user}/${repo.name}/languages`);
        if (request.data) {
            const max = {
                name: null,
                value: 0
            };
            const t = request.data;
            for (const oneLang in t) {
                if (max.value < t[oneLang]) {
                    max.name = oneLang;
                    max.value = t[oneLang];
                }
            }
            if (max.name) {
                data[i].lang = max.name;
                data[i].lang_color = (colors[max.name] || { color: null }).color;
            } else {
            }
        }
    }
    data = data.sort((a, b) => {
        const val1 = a.url && a.url.startsWith("https://api.github.com/gists/");
        const val2 = b.url && b.url.startsWith("https://api.github.com/gists/")
        if (val1 && val2) {
            return 0;
        } else if (val1) {
            return 1;
        } else if (val2) {
            return -1;
        } else {
            return a.name.localeCompare(b.name);
        }
    });
    fs.writeFileSync("./data/projects.json", JSON.stringify(data, null, 4));
};


const addToData = (array) => {
    for (const oneElement of array) {
        const isInArray = data.findIndex((element) => {
            return element.url === oneElement.url;
        });
        if (isInArray == -1) {
            data.push(oneElement);
        }
    }
};

getGitHubData()