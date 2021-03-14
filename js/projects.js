let files = window.location.search.split("=");
document.getElementById("linkToGitHub").href = `https://github.com/Its-Just-Nans/${files[1]}`;
document.getElementById("frontTitle").innerHTML = files[1];

let url = `https://raw.githubusercontent.com/Its-Just-Nans/${files[1]}/master/README.md`;
renderSpecialObject(url, function (response) {
    let converter = new showdown.Converter();
    converter.setFlavor("github");
    let html = converter.makeHtml(response);
    document.getElementById("projects").innerHTML = html;
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });
}, false);

renderSpecialObject(`https://api.github.com/repos/Its-Just-Nans/${files[1]}`, function (data) {
    const apiJSON = JSON.parse(data);
    if (apiJSON["has_pages"]) {
        document.getElementById("linkToHTML").href = `${window.location.origin}/${files[1]}`;
    } else {
        document.getElementById("linkToHTML").remove();
    }
}, false);