function smollPopUp(message, type, callBack) {
        const longMsg = 75;
        let infoDisp;
        let msg;
        if(message.title){
            if(message.title.length > longMsg){
                infoDisp = message.title.substring(0, longMsg);
                infoDisp += '...';
            }else{
                infoDisp = message.title;
            }
        }
        const longTitle = 40;
        if(message.content){
            if(message.content.length > longTitle){
                msg = message.content.substring(0, longTitle);
                msg += '...';
            }else{
                msg = message.content;
            }
        }
        let popUp = document.createElement('div');
        popUp.className = 'smollPopUp';
        let titleOfPopUp = document.createElement('h4');
        titleOfPopUp.innerHTML = infoDisp;
        titleOfPopUp.style.margin = '0px 0px 5px 0px';
        popUp.appendChild(titleOfPopUp);
        let content = document.createElement('p');
        content.innerHTML = msg;
        content.style.margin = '0px 0px 5px 0px';
        popUp.appendChild(content);
        popUp.style.position = 'fixed';
        popUp.style.top = '25px';
        popUp.style.right = '-300px';
        popUp.style.zIndex = '10000';
        popUp.style.width = '300px';
        popUp.style.boxSizing = 'border-box';
        if(type === 'ok'){
            popUp.style.backgroundColor = 'LIGHTGREEN';
        }else if(type === 'ko'){
            popUp.style.backgroundColor = 'LIGHTSALMON';
        }
        //popUp.style.height = '100px';
        popUp.style.borderRadius = '10px';
        let style = document.createElement('style');
        style.innerHTML = '@keyframes smollTransition {0%{transform:translate(0,0)}35%{transform:translate(-325px,0)}75%{transform:translate(-325px,0)}100%{transform:translate(10px,0)}}';
        popUp.appendChild(style);
        popUp.style.padding = '10px';
        popUp.style.animationDuration = '5s';
        popUp.style.animationName = 'smollTransition';
        popUp.style.animationTimingFunction = 'ease-out';
        document.body.appendChild(popUp);
        if(callBack){
            let button = document.createElement('button');
            button.innerHTML = callBack.name;
            button.addEventListener('click', function(){callBack(message);}, false)
            popUp.appendChild(button);
        }
        setTimeout(()=>{
            popUp.parentNode.removeChild(popUp);
        }, 5000);
}
