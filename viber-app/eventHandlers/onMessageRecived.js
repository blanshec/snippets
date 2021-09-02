const initDatabase = require('../../lib/database');

const INFOMESSAGE = require('../../constants/INFOMESSAGES');
const KB_MESSAGES = require('../../constants/KEYBOARD_ACTIONS');
const KEYBOARD = require('../../constants/KEYBOARD_BUTTON_PRESETS');
const MESSAGE_TEXT = require('../../constants/MESSAGE_TEXTS');
const TICKET_STATUS = require('../../constants/TICKET_STATUS');
const ACTION = require('../../constants/ACTIONS');

let fd;
let viber;
let database;

exports = async (data, _fd, _viber) => {
    fd = _fd;
    viber = _viber;
    database = initDatabase(fd);
    try {
        console.log('On message recieved event:', data);
        if (KB_MESSAGES.ACTION_ARRAY.includes(data.message.text)) {
            //handle keyboard buttons
            switch (data.message.text) {
                case KB_MESSAGES.REQUEST_HELP.action:
                    await database.updateRequester(data.sender.id, 'set', { lastUserAction: ACTION.user_pressed_keyboard });
                    viber.sendMessage({
                        receiver: data.sender.id,
                        type: 'text',
                        text: MESSAGE_TEXT.REQ_HELP_RESPONSE
                    });
                    break;
                case KB_MESSAGES.REQUEST_INFO.action:
                    await database.updateRequester(data.sender.id, 'set', { lastUserAction: ACTION.user_pressed_keyboard });
                    viber.sendKeyboardedMessage({
                        receiver: data.sender.id,
                        type: 'text',
                        text: MESSAGE_TEXT.BOT_INFO,
                        buttonsArray: KEYBOARD.MAIN_MENU
                    });
                    break;

                default:
                    break;
            }
        } else {
            await handleUserMessage(data);
        }
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

async function handleUserMessage(data) {
    try {
        const databaseEntry = await database.getRequester(`${data.sender.id}`);
        // console.log('Database entry: ', databaseEntry);

        if (databaseEntry.assignedTicket) {
            // console.log('has assigned ticket');
            const ticket = JSON.parse(await fd.getTicket(databaseEntry.assignedTicket));
            if (databaseEntry.lastUserAction === ACTION.ticket_preclosed) {
                // console.log('has preclose action');
                const today = new Date();
                const timestamp = today.toISOString();
                const precloseTime = 60;
                const preclosedTimestamp = addToDate(new Date(databaseEntry.precloseTimestamp), 'minute', precloseTime).toISOString();
                const preclosedTimerExeeded = timestamp > preclosedTimestamp ? true : false;
                if (preclosedTimerExeeded) {
                    // console.log('has exeeded preclose timestamp');
                    await archiveTicket(data.sender.id, databaseEntry.assignedTicket);
                    await createNewTicketFromMessage(data);
                } else {
                    // console.log('preclose ticking add message to old ticket');
                    await handleSubsequentMessage(databaseEntry, data);
                }
            } else {
                // console.log('has no preclose and has assigned ticket');
                const isTicketDeleted = ticket.deleted ? ticket.deleted : false;
                const isTicketClosed = ticket.status === TICKET_STATUS.CLOSED ? true : false;
                const isTicketResolved = ticket.status === TICKET_STATUS.RESOLVED ? true : false;
                if (!isTicketDeleted && !isTicketClosed && !isTicketResolved) {
                    await handleSubsequentMessage(databaseEntry, data);
                }
            }
        } else {
            //new ticket
            await database.setRequester(data.sender.id);
            await createNewTicketFromMessage(data);
        }
    } catch (error) {
        throw error;
    }
}

async function handleSubsequentMessage(databaseEntry, data) {
    try {
        const messageType = data.message.type;
        switch (messageType) {
            case 'text':
                await fd.createNote(
                    databaseEntry.assignedTicket,
                    await prepareSubsequentMessageObject({ text: data.message.text }, databaseEntry.freshdeskId)
                );
                break;
            case 'sticker':
                await fd.createNote(
                    databaseEntry.assignedTicket,
                    await prepareSubsequentMessageObject({ text: MESSAGE_TEXT.USER_SENT_STICKER }, databaseEntry.freshdeskId)
                );
                break;
            case 'picture':
            case 'video':
            case 'file':
                await fd.createNoteWithAttachment(
                    databaseEntry.assignedTicket,
                    await prepareSubsequentMessageObject({ file: data.message }, databaseEntry.freshdeskId)
                );
                break;
            default:
                await fd.createNote(
                    databaseEntry.assignedTicket,
                    await prepareSubsequentMessageObject({ text: MESSAGE_TEXT.USER_SENT_UNSUPPORTED }, databaseEntry.freshdeskId)
                );
                break;
        }
        await database.updateRequester(data.sender.id, 'set', {
            lastUserAction: databaseEntry.lastUserAction === ACTION.ticket_preclosed ? databaseEntry.lastUserAction : ACTION.user_messaged
        });
        console.log(INFOMESSAGE.FRESHDESK.NOTE_ADDED);
    } catch (error) {
        throw error;
    }
}

async function archiveTicket(viberId, ticketId) {
    try {
        await database.updateRequester(viberId, 'set', {
            assignedTicket: null,
            firstTimeRequest: false,
            lastUserAction: null,
            timeOfRequest: null,
            precloseTimestamp: null
        });
        await database.updateRequester(viberId, 'append', {
            archivedTickets: [ticketId]
        });
        console.log(INFOMESSAGE.DATABASE.ARCHIVED);
    } catch (error) {
        throw error;
    }
}

async function createNewTicketFromMessage(data) {
    const ticket = JSON.parse(await fd.createTicket(prepareCreateTicketObject(data)));
    await database.updateRequester(data.sender.id, 'set', {
        assignedTicket: ticket.id,
        freshdeskId: ticket.requester_id,
        timeOfRequest: data.timestamp,
        lastUserAction: ACTION.user_requested_help
    });
    console.log(INFOMESSAGE.FRESHDESK.TICKET_CREATED);
}

function prepareCreateTicketObject(data) {
    const object = {
        phone: data.sender.id,
        name: data.sender.name,
        subject: `[VIBER] Request from ${data.sender.name}`,
        priority: 1,
        status: 2,
        source: 7,
        description: data.message.text
    };
    return object;
}

async function prepareSubsequentMessageObject(props, userId) {
    let body;
    let object;
    if (props.text) {
        body = props.text;
        object = { body };
    } else if (props.file) {
        object = { attachments: [{ url: props.file.media, name: props.file.file_name }], body: props.file.file_name };
    }
    object = {
        ...object,
        incoming: true,
        private: false,
        user_id: userId
    };
    return object;
}

//HELPERES
function isEmpty(value) {
    return value === undefined || value === null || value === '';
}

/**
 * Adds time to a date. Modelled after MySQL DATE_ADD function.
 * Example: dateAdd(new Date(), 'minute', 30)  //returns 30 minutes from now.
 * https://stackoverflow.com/a/1214753/18511
 *
 * @param date  Date to start with
 * @param interval  One of: year, quarter, month, week, day, hour, minute, second
 * @param units  Number of units of the given interval to add.
 */
function addToDate(date, interval, units) {
    if (!(date instanceof Date)) return undefined;
    let ret = new Date(date); //don't change original date
    const checkRollover = function () {
        if (ret.getDate() != date.getDate()) ret.setDate(0);
    };
    switch (String(interval).toLowerCase()) {
        case 'year':
            ret.setFullYear(ret.getFullYear() + units);
            checkRollover();
            break;
        case 'quarter':
            ret.setMonth(ret.getMonth() + 3 * units);
            checkRollover();
            break;
        case 'month':
            ret.setMonth(ret.getMonth() + units);
            checkRollover();
            break;
        case 'week':
            ret.setDate(ret.getDate() + 7 * units);
            break;
        case 'day':
            ret.setDate(ret.getDate() + units);
            break;
        case 'hour':
            ret.setTime(ret.getTime() + units * 3600000);
            break;
        case 'minute':
            ret.setTime(ret.getTime() + units * 60000);
            break;
        case 'second':
            ret.setTime(ret.getTime() + units * 1000);
            break;
        default:
            ret = undefined;
            break;
    }
    return ret;
}
