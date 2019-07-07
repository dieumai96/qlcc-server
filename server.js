const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const log = require('./lib/logUtil');

const port = process.env.PORT || 3000;
const portSocket = process.env.PORT || 5000;
const io = require('socket.io')(portSocket);

var online_users = {};

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
    // creating new user if nickname doesn't exists
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
})

mongoose.connect(`mongodb://localhost/express-qlcc-version2`)
    .then(res => console.log('Connected MongoDB'))
    .catch(err => console.log(err));
app.listen(port, () => {
    console.log(`Server in running in port ${port}`);
})