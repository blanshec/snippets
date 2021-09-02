const request = require('request');

function createPromiseRequest(options) {
    return new Promise(function (resolve, reject) {
        request(options, (error, response, body) => {
            if (error || (response !== undefined && `${response.statusCode}`[0] !== '2')) {
                const errorObj = {
                    status: response.statusCode,
                    description: response.statusMessage
                };
                if (body) {
                    errorObj.body = body;
                }
                reject(errorObj);
            } else {
                resolve(body);
            }
        });
    });
}
function retryPromiseRequest(promisedFunc, times) {
    const args = Array.from(arguments);
    return promisedFunc.apply(null, args.slice(2)).catch((error) => {
        if (times - 1 > 0) {
            times--;
            args[1] = times;
            return retryPromiseRequest.apply(null, args);
        }
        return Promise.reject(error);
    });
}
function postMultipart(url, headers, body) {
    const config = {
        url,
        method: 'POST',
        headers: {
            ...headers,
            'content-type': 'multipart/form-data'
        }
    };

    return new Promise(function (resolve, reject) {
        const r = request.post(config, (error, response, responseBody) => {
            if (error || (response !== undefined && `${response.statusCode}`[0] !== '2')) {
                const errorObj =
                    response !== undefined && response.statusCode && responseBody
                        ? { status: response.statusCode, description: responseBody, error }
                        : { details: response, error };
                reject(errorObj);
            } else {
                resolve(responseBody);
            }
        });

        const form = r.form();

        Object.entries(body).forEach(([key, value]) => {
            if (key === 'attachments') {
                value.forEach((attachment) => {
                    form.append('attachments[]', request(attachment.url), { filename: attachment.name });
                });
            } else {
                const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                form.append(key, stringValue);
            }
        });
    });
}

exports = {
    createPromiseRequest,
    retryPromiseRequest,
    postMultipart
};
