var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open( "GET", aUrl, true );            
        anHttpRequest.send( null );
    }
}

var obj = [];
var client = new HttpClient();
client.get('https://api.github.com/users/Its-Just-Nans/repos', function(response) {
     obj = JSON.parse(response);
     for(element of obj){
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
     
});

