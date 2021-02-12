if(window.location == 'https://its-just-nans.github.io/Its-Just-Nans.github.io/'){
    window.location = 'https://its-just-nans.github.io/';
}

function render(projects){
    document.getElementById('projects').innerHTML = '';
    //utilisation du json
    /*let toDelete;
    Object.keys(projects).forEach(function(key) {
        if(projects[key].name == 'Its-Just-Nans.github.io'){
            toDelete = key;
        }
    });
    if(toDelete){
        projects.splice(toDelete, 1);
    }*/
    for(let element of projects){
        //we don't render fork
        if(element.fork == false){
            let part = document.createElement('div');
            part.className = 'projectsClass';
            let title = document.createElement('h4');
            let link = document.createElement('a');
            link.href = './projects.html?name='+element['name'];
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
}

document.getElementById('frontTitle').innerHTML = document.title;

var goodData;
let client = new HttpClient();
client.get('https://its-just-nans.github.io/projects.json', function(response) {
    const backUpJSON = JSON.parse(response);
        if(document.getElementById('projects').innerHTML === ''){
            let tab = backUpJSON.slice();
            render(tab);
        }
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