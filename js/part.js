const urlParams = new URLSearchParams(window.location.search);
const pathToData = `${window.location.origin}/data/`;
if (urlParams.has("name")) {
    const nameOfPart = urlParams.get("name");
    generateElement(document.getElementById("frontTitle"), "a", { innerHTML: `Its-Just-Nans - ${nameOfPart}`, href: window.location.origin });
    document.getElementsByClassName("part")[1].id = `${nameOfPart}Part`;
    import("./renders.js").then(function (module) {
        const rendering = module.renders;
        for (let oneRender in rendering) {
            if (nameOfPart == oneRender) {
                rendering[oneRender]();
            }
        }
    });
} else {
    document.getElementById("titlePart").innerHTML = "It looks like this part doesn't exist :(";
    smollPopUp({ title: "Page not found", msg: "You are going to be redirected in 5 sec" }, { type: "ko" });
    setTimeout(function () {
        window.location = "https://its-just-nans.github.io/";
    }, 5000);
}
