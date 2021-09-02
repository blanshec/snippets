const initViber = require('./viber');

const onConversationStartHandler = require('./middlewares/ onConversationStart');
const onMessageRecivedHandler = require('./middlewares/onMessageRecived');
const onSubscribedHandler = require('./middlewares/onSubscribed');
const onUnsubscribedHandler = require('./middlewares/onUnsubscribed');
const onDeliveredMessageHandler = require('./middlewares/onDeliveredMessage');
const onSeenMessageHandler = require('./middlewares/onSeenMessage');

let viber;
let fd;

exports = function (token, _fd) {
    viber = initViber(token);
    fd = _fd;
    return {
        async onConversationStart(data) {
            console.log('---conversation---');
            return await onConversationStartHandler(data, viber);
        },
        onSubscribed() {
            console.log('---user subscribed---');
            return onSubscribedHandler(fd);
        },
        async onUnsbscribed(data) {
            return await onUnsubscribedHandler(data, fd);
        },
        async onDeliveredMessage(data) {
            return await onDeliveredMessageHandler(data, fd);
        },
        onSeenMessage() {
            return onSeenMessageHandler(fd);
        },
        async onMessageRecieved(data) {
            console.log('---user sent message---');
            return await onMessageRecivedHandler(data, fd, viber);
        }
    };
};
