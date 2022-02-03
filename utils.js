import axios from 'axios';
import fs from 'fs';

let data = JSON.parse(fs.readFileSync("./data/projects.json"));

console.log("Getting data...")

const getGitHubData = async () => {
    const url = "https://api.github.com/users/Its-Just-Nans/repos"
    const githubData = await axios.get(url);
    addToData(githubData.data);
    const urlGists = "https://api.github.com/users/its-just-nans/gists";
    const dataGist = await axios.get(urlGists);
    addToData(dataGist.data);
    data = data.filter((obj) => {
        return !obj.fork;
    })
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