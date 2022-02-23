function copy(param) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(param)
    } else {
        let copieur = document.createElement("textarea");
        copieur.value = param;
        copieur.innerHTML = param;
        copieur.style.width = "1px";
        copieur.style.height = "1px";
        document.body.appendChild(copieur);
        copieur.focus();
        copieur.select();
        document.execCommand("copy");
        try {
            window.getSelection().removeAllRanges();
        } catch (e) {
            console.log("Copy failed");
        }
        copieur.remove();
    }
}