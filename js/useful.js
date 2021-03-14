async function renderSpecialObject(name, callback, parse = true) {
    /*
        name: name of the file, ex :FILE.json
        callback: callBack to render with data
        parse: if we parse the response
        pathToData: (optional) set link to data in global variable
    */

    let url;
    if (name.endsWith(".json") && pathToData) {
        url = `${pathToData}${name}`;
    } else {
        url = name;
    }
    makeRequest("GET", url)
        .then(function (response) {
            console.log(`✔️${name}`);
            let data;
            if (parse) {
                data = JSON.parse(response);
            } else {
                data = response
            }
            callback(data);
            console.log(`⚙️${name}`);
        })
        .catch(function (error) {
            console.error(`❌${name}`);
            console.error(error);
        });
}
