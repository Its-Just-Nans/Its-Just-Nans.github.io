
var goodData;
let client = new HttpClient();
client.get('https://raw.githubusercontent.com/Its-Just-Nans/sudoku-resolver/master/README.md', function(response) {
    let converter = new showdown.Converter();
    let html = converter.makeHtml(response);
    document.getElementById('projects').innerHTML = html;
}, function (error){
    console.log('log: '+ error.toString());
});

//use goodData as JSON