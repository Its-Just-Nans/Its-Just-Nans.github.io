async function renderSpecialObject(name, callback) {
    makeRequest("GET", `${urlToData}${name}`)
        .then(function (responseAPI) {
            console.log(`✔️${name}`);
            const data = JSON.parse(responseAPI);
            callback(data);
            console.log(`⚙️${name}`);
        })
        .catch(function (error) {
            console.error(`❌${name}`);
            console.error(error);
        });
}
