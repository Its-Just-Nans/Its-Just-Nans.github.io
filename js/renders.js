const projects = async function () {
    renderSpecialObject({ url: "projects.json" }, function (data) {
        /*
            We first request the backup Json
            After, we use the GitHub API to check is there are any new projects (and re-render the projects part if so)
        */
        const noRender = ["Its-Just-Nans"];
        const render = function (projects) {
            let projectTag = document.getElementById("projectsPart");
            projectTag.innerHTML = "";
            let projectPart2 = generateElement(projectTag, "div");
            //use of json
            for (let element of projects) {
                //we don't render fork and some project in noDisplay
                if (element.fork == false && !noRender.includes(element.name)) {
                    const linkToImg = `https://github-readme-stats.vercel.app/api/pin/?username=its-just-nans&repo=${element.name}`;
                    let part2 = generateElement(projectPart2, "div", { className: "projectsClass2" });
                    let link2 = generateElement(part2, "a", { href: `https://github.com/Its-Just-Nans/${element.name}` });
                    generateElement(link2, "img", { src: linkToImg, className: "block" });
                }
            }
        };
        if (document.getElementById("projectsPart").innerHTML === "") {
            render(data);
        }
        renderSpecialObject({ url: "https://api.github.com/users/Its-Just-Nans/repos" }, function (dataFromAPI) {
            if (dataFromAPI.length != data.length) {
                smollPopUp({ title: "Message to admin", msg: "curl.exe -o data/projects.json https://api.github.com/users/Its-Just-Nans/repos" }, { type: "ko" }, function Copier(rep) {
                    copy(rep.msg);
                });
                render(dataFromAPI);
            }
        });
    });
};

const links = async function () {
    renderSpecialObject({ url: "links.json" }, function (data) {
        const table = generateElement(document.getElementById("linksPart"), "table");
        const tbody = generateElement(table, "tbody");
        let renderColum = function (row, link, content, className) {
            let column = document.createElement("td");
            if (className) {
                column.className = className;
            }
            if (link) {
                let oneLink = document.createElement("a");
                oneLink.innerHTML = content;
                oneLink.href = link;
                oneLink.target = "_blank";
                column.appendChild(oneLink);
            } else {
                column.innerHTML = content;
            }
            row.appendChild(column);
            return column;
        };
        for (let oneElement of data) {
            let row = document.createElement("tr");
            let ico = renderColum(row, oneElement.link, `<img src="${oneElement.ico}" class="iconSmall">`);
            ico.setAttribute("data-tooltip", oneElement.name);
            //renderColum(row, oneElement.link, oneElement.name);
            renderColum(row, oneElement.link, oneElement.link, "wordBreak hoverBlue");
            //this ico is from BitBucket
            let copySVG = `<span><svg width="24" height="24" viewBox="0 0 24 24" focusable="false" class="copyIcon"><g><path d="M10 19h8V8h-8v11zM8 7.992C8 6.892 8.902 6 10.009 6h7.982C19.101 6 20 6.893 20 7.992v11.016c0 1.1-.902 1.992-2.009 1.992H10.01A2.001 2.001 0 0 1 8 19.008V7.992z"></path><path d="M5 16V4.992C5 3.892 5.902 3 7.009 3H15v13H5zm2 0h8V5H7v11z"></path></g></svg></span>`;
            let copyColumn = renderColum(row, null, copySVG);
            copyColumn.onclick = function () {
                let link = this.parentNode.children[0].children[0].href;
                copy(link);
                smollPopUp({ title: "Copied", msg: "" }, { type: "ok" });
            };
            row.appendChild(copyColumn);
            tbody.appendChild(row);
        }
        TOOLTIPload();
    });
};
const activity = async function () {
    renderSpecialObject({ url: "activity.json" }, function (data) {
        let root = document.getElementById("activityPart");
        let createProjectCard = function (row, element) {
            row.className = "otherProjectsDiv";
            generateElement(row, "img", { className: "iconSmall", src: element.ico });
            generateElement(row, "h3", { innerHTML: ` - ${element.name}`, className: "titleOtherProjects" });
            //icon frow material ui
            let ico = generateElement(row, "div", {
                innerHTML: '<svg class="MuiSvgIcon-root jss172" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>',
                className: "iconSmall iconShowMore",
            });
            let div = generateElement(row, "div", { className: "otherProjectsDivDetails" });
            generateElement(div, "p", { innerHTML: element.description });
            for (let oneUrl of element.urls) {
                generateElement(div, "a", { innerHTML: oneUrl, href: oneUrl, className: "wordBreak" });
                generateElement(div, "br");
                generateElement(div, "br");
            }
        };
        for (let oneElement of data) {
            let row = document.createElement("div");
            createProjectCard(row, oneElement);
            row.onclick = function () {
                let ico = this.childNodes[2];
                let detail = this.childNodes[3];
                if (detail.className == "otherProjectsDivDetails") {
                    detail.className = "otherProjectsDivDetails otherProjectsDivDetailsOpen";
                    //icon frow material ui
                    ico.innerHTML = '<svg focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 13H5v-2h14v2z"></path></svg>';
                } else {
                    detail.className = "otherProjectsDivDetails";
                    //icon frow material ui
                    ico.innerHTML = '<svg focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>';
                }
            };
            root.appendChild(row);
        }
    });
};
const languages = async function () {
    renderSpecialObject({ url: "languages.json" }, function (data) {
        let root = document.getElementById("languagesPart");
        let addlang = function (row, element) {
            row.className = "inline";
            row.setAttribute("data-tooltip", element.name);
            let link = generateElement(row, "a", { href: element.link });
            generateElement(link, "img", { className: "iconLang", alt: element.name, src: element.ico }, null);
        };
        for (let oneElement of data) {
            let row = document.createElement("div");
            addlang(row, oneElement);
            root.appendChild(row);
        }
        TOOLTIPload();
    });
};

const videos = async function () {
    renderSpecialObject({ url: "videos.json" }, function (data) {
        let root = document.getElementById("videosPart");
        let addVideo = function (row, element) {
            let link = generateElement(row, "a", { href: `https://youtu.be/${element.id}`, className: "full" });
            let figure = generateElement(link, "figure");
            generateElement(figure, "img", { alt: element.title, src: `https://img.youtube.com/vi/${element.id}/maxresdefault.jpg` });
            let figcaption = generateElement(figure, "figcaption");
            generateElement(figcaption, "h4", { innerHTML: element.title });
            generateElement(figcaption, "p", { innerHTML: element.desc || "" });
        };
        for (let oneElement of data) {
            let row = generateElement(null, "div", { className: "videosClass" });
            addVideo(row, oneElement);
            root.appendChild(row);
        }
    });
};

const history = async function () {
    const name = "history";
    renderSpecialObject({ url: `${name}.json` }, function (data) {
        let root = document.getElementById(`${name}Part`);
        const viewBox = "-4 2 32 32";
        let addHistory = function (parent, element) {
            const onClickFunction = function () {
                let line = this.parentNode;
                let ico = this.childNodes[3];
                if (line.className == "historyLine") {
                    line.className = "historyLine historyLineOpen";
                    //icon frow material ui
                    ico.innerHTML = `<svg focusable="false" viewBox="${viewBox}" aria-hidden="true"><path d="M19 13H5v-2h14v2z"></path></svg>`;
                } else {
                    line.className = "historyLine";
                    //icon frow material ui
                    ico.innerHTML = `<svg focusable="false" viewBox="${viewBox}" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>`;
                }
            };
            let line = generateElement(parent, "div", { onclick: onClickFunction });
            generateElement(line, "p", { innerHTML: element.date || "?" });
            generateElement(line, "img", { className: "iconSmall", src: element.ico || "" });
            generateElement(line, "p", { innerHTML: element.title || "" });
            let ico = generateElement(line, "div", {
                innerHTML: `<svg focusable="false" viewBox="${viewBox}" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>`,
                className: "iconSmall iconShowMore",
            });
            let details = generateElement(parent, "div");
            generateElement(details, "div", { className: "historyDetail", innerHTML: element.desc || "" });
        };
        for (let oneElement of data) {
            let parent = generateElement(root, "div", { className: "historyLine" });
            addHistory(parent, oneElement);
        }
    });
};
const renders = { projects, languages, links, activity, videos, history };
export { renders };
