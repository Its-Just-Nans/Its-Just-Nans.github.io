if (window.location == "https://its-just-nans.github.io/Its-Just-Nans.github.io/") {
    window.location = "https://its-just-nans.github.io/";
}

document.getElementById("frontTitle").innerHTML = document.title;

const pathToData = `${window.location.origin}/data/`;
// we use window.location.origin to use the site in local
const noRender = ["Its-Just-Nans"];

function render(projects) {
    let projectTag = document.getElementById("projects");
    projectTag.innerHTML = "";
    //use of json
    for (let element of projects) {
        //we don't render fork and some project in noDisplay
        if (element.fork == false && !noRender.includes(element.name)) {
            let part = generateElement(projectTag, "div", { className: "projectsClass" });
            let link = generateElement(part, "a", { href: `./projects.html?name=${element.name}`, className: "full black nothing" });
            generateElement(link, "h4", { className: "projectsClassTitle", innerHTML: element.name });
            generateElement(link, "p", { className: "projectDesc", innerHTML: element.description || "" });
        }
    }
}

renderSpecialObject("projects.json", function (data) {
    /*
        We first request the backup Json
        After, we use the GitHub API to check is there are any new projects (and re-render the projects part if so)
    */
    if (document.getElementById("projects").innerHTML === "") {
        render(data);
    }
    renderSpecialObject("https://api.github.com/users/Its-Just-Nans/repos", function (dataFromAPI) {
        if (dataFromAPI.length != data.length) {
            smollPopUp({ title: "Message to admin", content: "curl.exe -o data/projects.json https://api.github.com/users/Its-Just-Nans/repos" }, "ko", function Copier(rep) {
                copy(rep.content);
            });
            render(dataFromAPI);
        }
    });
});

renderSpecialObject("links.json", function (data) {
    let tbody = document.getElementById("bodyLinks");
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
            smollPopUp({ title: "Copied", content: "" }, "ok");
        };
        row.appendChild(copyColumn);
        tbody.appendChild(row);
    }
});

renderSpecialObject("otherProjects.json", function (data) {
    let root = document.getElementById("othersProjects");
    let createProjectCard = function (row, element) {
        row.className = "otherProjectsDiv";
        generateElement(row, "img", { className: "iconSmall", src: element.ico });
        generateElement(row, "h3", { innerHTML: ` - ${element.name}`, className: "titleOtherProjects" });
        //icon frow material ui
        let ico = generateElement(row, "div", {
            innerHTML: '<svg class="MuiSvgIcon-root jss172" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>',
            className: "iconSmall iconShowMore",
            src: "https://image.flaticon.com/icons/png/128/4200/4200419.png",
        });
        let div = generateElement(row, "div", { className: "otherProjectsDivDetails" });
        div.style.display = "none";
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
            if (detail.style.display == "none") {
                detail.style.display = "block";
                //icon frow material ui
                ico.innerHTML = '<svg focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 13H5v-2h14v2z"></path></svg>';
            } else {
                detail.style.display = "none";
                //icon frow material ui
                ico.innerHTML = '<svg focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>';
            }
        };
        root.appendChild(row);
    }
});

renderSpecialObject("languages.json", function (data) {
    let root = document.getElementById("languages");
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
});

renderSpecialObject("videos.json", function (data) {
    let root = document.getElementById("videos");
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
