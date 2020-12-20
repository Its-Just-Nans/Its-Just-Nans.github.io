var HttpClient = function() {
    this.get = function(aUrl, aCallBack, aErrorCallBack) {
        try{
            var anHttpRequest = new XMLHttpRequest();
            anHttpRequest.onreadystatechange = function() { 
                if (anHttpRequest.readyState == 4){
                    if(anHttpRequest.status == 200){
                        aCallBack(anHttpRequest.responseText);
                    }else if(anHttpRequest.status == 403){
                        aErrorCallBack(anHttpRequest.statusText);
                    }else{
                        aErrorCallBack();
                    }
                }
            };
            anHttpRequest.onerror = function(e){
                aErrorCallBack(e);
            };
            anHttpRequest.open("GET", aUrl, true);     
            anHttpRequest.send(null);
        }catch(error){
            aErrorCallBack(error);
        }
    }
}

function copy(param){
    let copieur = document.createElement('textarea');
    copieur.value = param;
    copieur.innerHTML = param;
    copieur.style.width = '1px';
    copieur.style.height = '1px';
    document.body.appendChild(copieur);
    copieur.focus();
    copieur.select();
    document.execCommand('copy');
    try{
        window.getSelection().removeAllRanges();
    }catch(e){
        console.log('Copy fail')
    }
    copieur.remove();
}