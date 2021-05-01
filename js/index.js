if (window.location == "https://its-just-nans.github.io/Its-Just-Nans.github.io/") {
    window.location = "https://its-just-nans.github.io/";
}

if (window.location.hash !== "") {
    setTimeout(() => {
        const hash = window.location.hash;
        window.location.hash = "";
        window.location.hash = hash;
        const elementID = hash.substring(1);
        if (document.getElementById(elementID)) {
            document.getElementById(elementID).className = "wink";
            setTimeout(() => {
                document.getElementById(elementID).className = "";
            }, 3000);
        }
    }, 1500);
}

document.getElementById("frontTitle").innerHTML = document.title.split('-')[0];

import("./renders.js").then(function (module) {
    const rendering = module.renders;
    for (let oneRender in rendering) {
        rendering[oneRender]();
    }
});
