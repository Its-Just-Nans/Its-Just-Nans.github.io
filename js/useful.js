async function renderSpecialObject(params = { url: url, parse: true }, callback, errorCallBack = null) {
    /*
        name: name of the file, ex :FILE.json
        callback: callBack to render with data
        parse: if we parse the response
        pathToData: (optional) set link to data in global variable
    */
    const { url, parse } = params;
    let link;
    if (url.endsWith(".json") && pathToData) {
        link = `${pathToData}${url}`;
    } else {
        link = url;
    }
    makeRequest("GET", link)
        .then(function (response) {
            console.log(`✔️${url}`);
            let data;
            if (!parse) {
                data = JSON.parse(response);
            } else {
                data = response;
            }
            callback(data);
            console.log(`⚙️${url}`);
        })
        .catch(function (error) {
            console.error(`❌${url}`);
            console.error(error);
            if (errorCallBack) {
                errorCallBack(error);
            }
        });
}
