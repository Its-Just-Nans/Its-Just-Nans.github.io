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
    try{window.getSelection().removeAllRanges();}catch(e){}
}

function render(projects){
    document.getElementById('projects').innerHTML = '';
    //utilisation du json
    let toDelete;
    Object.keys(projects).forEach(function(key) {
        if(projects[key].name == 'Its-Just-Nans.github.io'){
            toDelete = key;
        }
    });
    if(toDelete){
        projects.splice(toDelete, 1);
    }
    for(element of projects){
        let part = document.createElement('div');
        part.className = 'projectsClass';
        let title = document.createElement('h4');
        let link = document.createElement('a');
        link.href = '/'+element['name'];
        link.className = 'full';
        link.className += ' black';
        link.className += ' nothing';
        title.className = 'projectsClassTitle';
        title.innerHTML = element['name'];
        part.appendChild(link);
        link.appendChild(title);
        document.getElementById('projects').appendChild(part);
    }
}

var goodData;
let client = new HttpClient();
client.get('https://its-just-nans.github.io/projects.json', function(response) {
    const backUpJSON = JSON.parse(response);
    setTimeout( ()=>{
        if(document.getElementById('projects').innerHTML === ''){
            let tab = backUpJSON.slice();
            render(tab);
        }
    }, 200);
    let client2 = new HttpClient();
    client2.get('https://api.github.com/users/Its-Just-Nans/repos', function(responseAPI) {
        console.log('✔️:responseAPI');
        const apiJSON = JSON.parse(responseAPI);
        if(apiJSON.length != backUpJSON.length){
            smollPopUp({title : 'Message to admin', content : 'curl.exe -o projects.json https://api.github.com/users/Its-Just-Nans/repos'}, 'ko', function Copier(rep){copy(rep.content)})
            goodData = apiJSON;
            let renderer = goodData;
            render(renderer);
            console.log('✔️:render with API data');
        }
    }, function(error){
        console.log('❌:responseAPI');
        console.log(error);
    });
}, function (error){
    console.log('log: '+ error.toString());
});

//use goodData as JSON