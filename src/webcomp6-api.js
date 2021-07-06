export default function(query, successfunc = null, errorfunc = null) {
    const url = `https://mobility.api.opendatahub.bz.it/v2/flat/${query}`;
    fetch(url)
    .then((response) => {

        // Return a new promise such that we do not loose the json response,
        // which might contain useful information also during error reporting
        return new Promise((resolve, reject) => {
            let func = response.status < 400 ? resolve : reject;
            response.json().then(data => func({
                status: response.status,
                statusText: response.statusText,
                data: data
            }));
        });
    })

    // Success
    .then((response) => {
        if (response.status >= 200 && response.status <= 299) {
            if (successfunc) 
                successfunc(response);
            else
                console.warn("Unhandled successful API response!")
        }
    })

    // Error handling 
    // (usually only network errors would arrive here, without the first .then block)
    .catch((error) => {
        if (errorfunc) 
            errorfunc(error);
        else
            throw new Error(error);
    });
}
