const initFd = require('../lib/freshdesk');
const initViberEventHandler = require('../lib/viberEventHandler');
const EVENTS = require('../constants/EVENTS').VIBER_EVENTS;
const ERROR = require('../constants/ERRORS');

let fd;
let viberEventHandler;
let invokedEvent;

async function handlePrerequisites(payload) {
    console.log('Handling external event prereqs:', payload);
    data = payload.data;
    fd = initFd(payload.iparams);
    viberEventHandler = initViberEventHandler(payload.iparams.viberApiKey, fd);
    invokedEvent = EVENTS.find((event) => event.eventName === data.event);
}

async function handleExternalEvent(payload) {
    await handlePrerequisites(payload);
    try {
        console.log('Viber External event:', payload);
        if (!isEmpty(invokedEvent)) {
            viberEventHandler[invokedEvent.callback](data, fd);
        } else {
            throw new Error(ERROR.SYSTEM.CALLBACK);
        }
    } catch (error) {
        console.log(error);
    }
}

function isEmpty(value) {
    return value === undefined || value === null || value === '';
}

exports.handle = handleExternalEvent;
