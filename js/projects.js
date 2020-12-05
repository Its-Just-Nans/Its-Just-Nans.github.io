
var goodData;

let files = window.location.search.split('=');
document.getElementById('linkToGitHub').href = 'https://github.com/Its-Just-Nans/' + files[1];

try{
    let client = new HttpClient();
    client.get('https://raw.githubusercontent.com/Its-Just-Nans/'+files[1]+'/master/README.md', function(response) {
        let converter = new showdown.Converter();
        converter.setFlavor('github');
        let html = converter.makeHtml(response);
        document.getElementById('projects').innerHTML = html;
        document.getElementById('frontTitle').innerHTML = files[1];
        let client2 = new HttpClient();
        client2.get("https://api.github.com/repos/Its-Just-Nans/" + files[1], function(responseAPI){
            const apiJSON = JSON.parse(responseAPI);
            if(apiJSON["has_pages"]){
                document.getElementById('linkToHTML').href = window.location.origin + '/' + files[1];
            }else{
                document.getElementById('linkToHTML').remove();
            }
        }, function(error){
            document.getElementById('linkToHTML').remove();
        });        
    }, function (error){
        smollPopUp({title : 'Page not found', content : 'You are going to be redirected in 5 sec'}, 'ko');
        document.getElementById('titleProject').innerHTML = 'It looks like there are no readMe :(';
        document.getElementById('linkToHTML').remove();
        setTimeout(function(){window.location = 'https://its-just-nans.github.io/'}, 5000);
    });
}catch(error){
    console.log(error)
}
//use goodData as JSON