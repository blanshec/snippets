const domain = 'https://chatapi.viber.com/';

const { createPromiseRequest, retryPromiseRequest } = require('./utils');

exports = function (token) {
    return {
        _request(targetUrl, method, targetBody) {
            const url = domain + targetUrl;
            const headers = {
                'content-type': 'application/json',
                'X-Viber-Auth-Token': token
            };
            const options = {
                method,
                url,
                headers
            };
            const body = targetBody;
            if (body !== undefined) {
                options.body = typeof body === 'string' ? body : JSON.stringify(body);
            }

            return retryPromiseRequest(createPromiseRequest, 3, options);
        },
        async get(props) {
            try {
                const response = await this._request(props.targetUrl, 'get', props.body);
                if (response.status === 0) {
                    return JSON.parse(response.body);
                } else {
                    console.log(response);
                    throw new Error('Error making GET request to Viber');
                }
            } catch (error) {
                console.log(error);
            }
        },
        async post(props) {
            if (!props.body) {
                props.body = {};
            }
            try {
                const response = JSON.parse(await this._request(props.targetUrl, 'post', props.body));
                if (response.status === 0) {
                    return response;
                } else {
                    console.log(response);
                    throw new Error('Error making POST request to Viber');
                }
            } catch (error) {
                console.log(error);
            }
        },
        async createWebhook(webhookTargetUrl) {
            const targetUrl = `pa/set_webhook`;
            // const encodedURI = encodeURIComponent(webhookTargetUrl);
            const body = {
                url: webhookTargetUrl,
                event_types: ['delivered', 'seen', 'failed', 'subscribed', 'unsubscribed', 'conversation_started'],
                send_name: true,
                send_photo: true
            };
            const response = await this.post({ targetUrl, body });
            console.log('Viber create webhook response:', response);
            return response;
        },
        async getAccountInfo() {
            const targetUrl = 'pa/get_account_info';
            const response = await this.post({ targetUrl });
            return response;
        },
        async sendMessage(props) {
            if (!props.responderName) {
                props.responderName = 'Virtual Assistant';
            }
            const targetUrl = 'pa/send_message';
            const body = {
                receiver: props.receiver,
                min_api_version: 1,
                sender: {
                    name: props.responderName,
                    avatar: 'http://avatar.example.com'
                },
                // tracking_data: 'tracking data',
                type: props.type,
                text: props.text
            };
            const response = await this.post({ targetUrl, body });
            return response;
        },
        async sendKeyboardedMessage(props) {
            const targetUrl = 'pa/send_message';
            const body = {
                receiver: props.receiver,
                min_api_version: 7,
                type: props.type,
                text: props.text,
                keyboard: {
                    Type: 'keyboard',
                    DefaultHeight: true,
                    Buttons: props.buttonsArray
                }
            };
            const response = await this.post({ targetUrl, body });
            return response;
        }
    };
};
