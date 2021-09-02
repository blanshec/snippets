const MESSAGE = require('../../constants/INFOMESSAGES');
const initDatabase = require('../database');

let fd;
let database;

exports = async (data, _fd) => {
    fd = _fd;
    database = initDatabase(fd);
    try {
        await database.deleteRequester(data.user_id);
        console.log(MESSAGE.VIBER.UNSUBSCRIBED);
    } catch (error) {
        throw new Error(error);
    }
};
