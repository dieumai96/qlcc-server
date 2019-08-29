
const log = require('./../../lib/logUtil');
const User = require('./../../models/eventUser')
const Employee = require('./../../models/employeeSchema')
const Flat = require('./../../models/flatSchema')
const Building = require('./../../models/buildingSchema')

const CONST = require('./../../config/const');
const portSocket = process.env.PORT || 5000;
const io = require('socket.io')(portSocket);
var SocketHandler = {};

var online_users = {};

function sendMsgBySql(listAccountID, data, eventName, sessionID) {

    let async = require("async");
    log.info("=========== listAccountID: ", listAccountID);
    for (let i = 0, keys = Object.keys(online_users), ii = keys.length; i < ii; i++) {
        if (online_users[keys[i]] && online_users[keys[i]].userID) {
            log.info("=========== online_users   userID: ", online_users[keys[i]].userID);
            log.info("----------and ---------sessionID: ", online_users[keys[i]].sessionID);
        } else {
            log.info("=========== key ko co socket: ", keys[i]);
        }
    }
    async.forEach(listAccountID, function (accountID, callback1) {
        log.info("=========== processs employeeID: ", accountID);
        for (let i = 0, keys = Object.keys(online_users), ii = keys.length; i < ii; i++) {
            if (online_users[keys[i]] && online_users[keys[i]].userID) {
                let userId = online_users[keys[i]].userID.trim();
                if (accountID == userId) {
                    if (online_users[keys[i]].sessionID && online_users[online_users[keys[i]].sessionID]) {
                        log.info("socket on send-msg to user ", accountID);
                        log.info("-----------sessionID: ", online_users[keys[i]].sessionID);
                        log.info("-------------msg data: ", data);
                        online_users[online_users[keys[i]].sessionID].emit(eventName, data);
                    }
                }
            }
        }
        callback1();
    }, function (err) {
        if (err) {
            log.error("get all comment has error: " + err);
        } else {
            log.info("processing all employee");
        }
    });
}


SocketHandler.init = function () {
    io.on('connection', function (socket) {
        log.info("---------socket.io on connection with userId:", socket.userID);
        log.info("---------socket.io on connection with sessionID:", socket.sessionID);
        let keys = Object.keys(online_users);
        for (let i = 0; i < keys.length; i++) {
            if (online_users[keys[i]] && online_users[keys[i]].userID) {
                log.info("=========== key co socket: ", keys[i]);
                log.info("=========== cua user: ", online_users[keys[i]].userID);
            } else {
                delete online_users[keys[i]];
            }
        }
        socket.emit('check user reconnect');
        socket.on('new-user', function (data, callback) {
            log.info("=============================new-user===============data: ", data);
            log.info("===========sessionId chuan bi them: ", data.sessionID);
            if (online_users[data.sessionID]) {
                if (callback)
                    callback({
                        success: false
                    });
            } else {
                if (callback)
                    callback({
                        success: true
                    });
                log.info("----socket.io got one new sessionID for user " + data.userID + "----sectionID: ", data.sessionID);
                socket.userID = data.userID;
                socket.userType = data.userType;
                socket.sessionID = data.sessionID;
                if (data.buildingID) {
                    socket.buildingID = data.buildingID.trim();
                }

                online_users[data.sessionID] = socket;
            }
            if (data.buildingID && data.userID) {
                log.info("=============================new-user===============emit online====================");
                for (var i = 0, keys = Object.keys(online_users), ii = keys.length; i < ii; i++) {
                    if (online_users[keys[i]].sessionID && (online_users[keys[i]].sessionID.trim() != data.sessionID.trim()) && online_users[keys[i]].buildingID && (online_users[keys[i]].buildingID.trim() == data.buildingID) && online_users[keys[i]].userID && (online_users[keys[i]].userID.trim() != data.userID)) {
                        online_users[online_users[keys[i]].sessionID].emit('check user online res', { fromUserID: data.userID, isOline: true });
                    }
                }
            }
        })
        socket.on('send-notification', async function (data, callback) {
            log.error("=====================payload", data);
            let listEventUseID = [];
            let listEventEmployeeID = [];
            let queryEmployee = await Employee.find({
                buildingID: data.buildingID,
                status: { $in: [CONST.STATUS.ACTIVE, CONST.STATUS.WAIT_ACTIVE] }
            });
            queryEmployee.forEach(e => {
                listEventEmployeeID.push(
                    e._id
                );
            })
            if (data.notifyStatus == CONST.NOTIFY_STATUS.SEND) {
                if (data.notifyScope.type == CONST.SCOPE_NOTIFICATION.ALL) {
                    let query = await User.aggregate([
                        {
                            $match: {
                                $and: [
                                    { buildingID: data.buildingID },
                                    { status: { $in: [1, 2] } },
                                ]
                            },

                        },
                        {
                            $lookup:
                            {
                                from: "flats",
                                localField: "flatID",
                                foreignField: "_id",
                                as: "flat_info"
                            },
                        },
                    ])
                    query.forEach(e => {
                        listEventUseID.push(
                            e._id,
                        );
                    })
                }
                if (data.notifyScope.type == CONST.SCOPE_NOTIFICATION.BUILDING) {
                    let listBuilding = data.notifyScope.refs;
                    let query = await User.aggregate([
                        {
                            $match: {
                                $and: [
                                    { buildingID: data.buildingID },
                                    { status: { $in: [1, 2] } },
                                ]
                            },

                        },
                        {
                            $lookup:
                            {
                                from: "flats",
                                
                                localField: "flatID",
                                foreignField: "_id",
                                as: "flat_info"
                            },

                        },
                    ])
                    query.forEach(e => {
                        if (e.flat_info.length) {
                            if (listBuilding.includes(e.flat_info[0].block)) {
                                listEventUseID.push(
                                    e._id,
                                );
                            }
                        }
                    })
                }
                if (data.notifyScope.type == CONST.SCOPE_NOTIFICATION.FLAT) {
                    let flatScope = data.notifyScope.refs;
                    let flatList = await Flat.find({ _id: { $in: flatScope } });
                    let listIDFlat = [];
                    flatList.forEach(e => {
                        listIDFlat.push(e._id);
                    })
                    let query = await User.find({
                        buildingID: buildingID,
                        status: { $in: [1, 2] },
                        flatID: { $in: listIDFlat },
                    })
                    query.forEach(e => {
                        listEventUseID.push(
                            e._id,
                        );
                    })
                }
            }
            let allListEvent = await [...listEventEmployeeID, ...listEventUseID];
            allListEvent = allListEvent.filter(x => x != data.fromUserID);
            sendMsgBySql(allListEvent, data, 'new-notification');
        })
    })

}

module.exports = SocketHandler;