const INFOMESSAGE = require('../../constants/INFOMESSAGES');
const ERROR = require('../../constants/ERRORS');
const KEYBOARD = require('../../constants/KEYBOARD_BUTTON_PRESETS');
const MESSAGE_TEXT = require('../../constants/MESSAGE_TEXTS');

exports = async (data, viber) => {
    try {
        const welcomeOptionsButtonArray = KEYBOARD.MAIN_MENU;
        const response = await viber.sendKeyboardedMessage({
            receiver: data.user.id,
            type: 'text',
            text: MESSAGE_TEXT.CONVERSATION_START,
            buttonsArray: welcomeOptionsButtonArray
        });
        if (response.status === 0) {
            console.log(INFOMESSAGE.VIBER.MESSAGE_SENT);
        } else {
            throw ERROR.VIBER.KEYBOARD;
        }
    } catch (error) {
        console.log('error handling viber keyboard');
        throw new Error(error);
    }
};
