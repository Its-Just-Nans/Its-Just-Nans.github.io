
var goodData;

let files = window.location.search.split('=');

try{
    let client = new HttpClient();
    client.get('https://raw.githubusercontent.com/Its-Just-Nans/'+files[1]+'/master/README.md', function(response) {
        let converter = new showdown.Converter();
        let html = converter.makeHtml(response);
        document.getElementById('projects').innerHTML = html;
        document.getElementById('frontTitle').innerHTML = files[1];
    document.getElementById('linkToGitHub').href = 'https://github.com/Its-Just-Nans/' + files[1];
    document.getElementById('linkToHTML').href = window.location.origin + '/' + files[1];
    }, function (error){
        smollPopUp({title : 'Page not found', content : 'You are going to be redirected in 5 sec'}, 'ko');
        document.getElementById('titleProject').innerHTML = 'Its look like there are no readMe : (';
        setTimeout(function(){window.location = 'https://its-just-nans.github.io/'}, 5000);
    });
}catch(error){
    console.log(error)
}
//use goodData as JSON