const urlParams = new URLSearchParams(window.location.search);
const pathToData = `${window.location.origin}/data/`;

const goBackToMenu = function () {
    document.getElementById("titlePart").innerHTML = "It looks like this part doesn't exist :(";
    smollPopUp({ title: "Page not found", msg: "You are going to be redirected in 5 sec" }, { type: "ko" });
    setTimeout(function () {
        window.location = window.location.origin;
    }, 5000);
};

if (urlParams.has("name")) {
    const nameOfPart = urlParams.get("name");
    generateElement(document.getElementById("frontTitle"), "a", { innerHTML: `Its-Just-Nans - ${nameOfPart}`, href: window.location.origin });
    document.getElementsByClassName("part")[1].id = `${nameOfPart}Part`;
    import("./renders.js").then(function (module) {
        const rendering = module.renders;
        let renderFound = false;
        for (let oneRender in rendering) {
            if (nameOfPart == oneRender) {
                renderFound = true;
                rendering[oneRender]();
                break;
            }
        }
        if (renderFound == false) {
            goBackToMenu();
        }
    });
} else {
    goBackToMenu();
}
