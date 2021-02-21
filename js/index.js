if(window.location == 'https://its-just-nans.github.io/Its-Just-Nans.github.io/'){
    window.location = 'https://its-just-nans.github.io/';
}

function render(projects){
    document.getElementById('projects').innerHTML = '';
    //utilisation du json
    let noDisplay = ['Its-Just-Nans'];
    for(let element of projects){
        //we don't render fork and some project in noDisplay
        if(element.fork == false && !noDisplay.includes(element.name)){
            let part = document.createElement('div');
            part.className = 'projectsClass';
            let title = document.createElement('h4');
            let desc = document.createElement('p');
            let link = document.createElement('a');
            link.href = './projects.html?name='+element['name'];
            link.className = 'full';
            link.className += ' black';
            link.className += ' nothing';
            title.className = 'projectsClassTitle';
            title.innerHTML = element['name'];
            desc.innerHTML = element.description == null ? '' : element.description;
            desc.className = 'projectDesc';
            part.appendChild(link);
            link.appendChild(title);
            link.appendChild(desc);
            document.getElementById('projects').appendChild(part);
        }
    }
}

document.getElementById('frontTitle').innerHTML = document.title;

var goodData;
let urlBackUp = window.location.origin + '/data/projects.json';
// we use window.location.origin to use the site in local

/*
    We first request the backup Json (we can also GET that backup file with a script tag, like links.js), but this time I choose this method
    After, we use the GitHub API to check is there are any new projects (and re-render the projects part if so)
*/
makeRequest('GET', urlBackUp).then( function(response){
    const backUpJSON = JSON.parse(response);
        if(document.getElementById('projects').innerHTML === ''){
            let tab = backUpJSON.slice();
            render(tab);
        }
    let client2 = new HttpClient();
    makeRequest('GET', 'https://api.github.com/users/Its-Just-Nans/repos').then( function(responseAPI){
        console.log('✔️:responseAPI');
        const apiJSON = JSON.parse(responseAPI);
        if(apiJSON.length != backUpJSON.length){
            smollPopUp({title : 'Message to admin', content : 'curl.exe -o data/projects.json https://api.github.com/users/Its-Just-Nans/repos'}, 'ko', function Copier(rep){copy(rep.content)})
            goodData = apiJSON;
            let renderer = goodData;
            render(renderer);
            console.log('✔️:render with API data');
        }
    }).catch(function (error){
        console.log('log: ');
        console.error(error);
    });
}).catch(function (error){
    console.log('log: ');
    console.error(error);
});


if(links){
    let tbody = document.getElementById('bodyLinks');
    let renderColum = function(row, link, content, className){
        let column = document.createElement('td');
        if(className){
            column.className = className;
        }
        if(link){
            let oneLink = document.createElement('a');
            oneLink.innerHTML = content;
            oneLink.href = link;
            oneLink.target = "_blank";
            column.appendChild(oneLink);
        }else{
            column.innerHTML = content;
        }
        row.appendChild(column);
        return column;
    };
    for(let oneElement of links){
        let row = document.createElement('tr');
        renderColum(row, oneElement.link, `<img src="${oneElement.ico}" class="iconSmall">`, null);
        renderColum(row, oneElement.link, oneElement.name, null);
        renderColum(row, oneElement.link, oneElement.link, "wordBreak");
        //this ico is from BitBucket
        let copySVG = `<svg width="24" height="24" viewBox="0 0 24 24" focusable="false" class="copyIcon"><g><path d="M10 19h8V8h-8v11zM8 7.992C8 6.892 8.902 6 10.009 6h7.982C19.101 6 20 6.893 20 7.992v11.016c0 1.1-.902 1.992-2.009 1.992H10.01A2.001 2.001 0 0 1 8 19.008V7.992z"></path><path d="M5 16V4.992C5 3.892 5.902 3 7.009 3H15v13H5zm2 0h8V5H7v11z"></path></g></svg>`;
        let copyColumn = renderColum(row, null, copySVG);
        copyColumn.onclick = function(){
            let link = this.parentNode.children[0].children[0].href;
            copy(link);
            smollPopUp({title : "Copied", content : ''}, 'ok')
        };
        row.appendChild(copyColumn);
        tbody.appendChild(row);
        /*
        row.onclick = function(event){
            debugger
            if(!event.target.href){
                let page = row.children[0].children[0].href;
                win = window.open(page, '_blank');
                win.focus();
            }
        };
        */
    }
}