var HttpClient = function() {
    this.get = function(aUrl, aCallBack, aErrorCallBack) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState == 4){
                if(anHttpRequest.status == 200){
                    aCallBack(anHttpRequest.responseText);
                }else if(anHttpRequest.status == 403){
                    aErrorCallBack(anHttpRequest.statusText);
                }
            }
        };
        anHttpRequest.onerror = function(e){
            aErrorCallBack(e);
        };
        anHttpRequest.open("GET", aUrl, true);     
        anHttpRequest.send(null);
    }
}

var projects;
let client = new HttpClient();
client.get('https://its-just-nans.github.io/projects.json', function(response) {
    //console.log(response)
    projects = JSON.parse(response);
    var actualProjectsJSON = undefined;

    let client2 = new HttpClient();
    client2.get('https://api.github.com/users/Its-Just-Nans/repos', function(responseAPI) {
        actualProjectsJSON = JSON.parse(responseAPI);
    }, function(error){
        console.log('log: '+ error.toString());
    });
    if(actualProjectsJSON){
        if(actualProjectsJSON != projects){
            alert('curl.exe -o projects.json https://api.github.com/users/Its-Just-Nans/repos');
            projects = actualProjectsJSON;
        }
    }
    
    //utilisation du json
    let toDelete;
    Object.keys(projects).forEach(function(key) {
        if(projects[key].name == 'Its-Just-Nans.github.io'){
            toDelete = key;
        }
    });
    projects.splice(toDelete, 1);
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
}, function (error){
    console.log('log: '+ error.toString());
});



