const express = require('express');
const Employee = require('./../../models/employeeSchema');
const passport = require('passport');
const CONST = require('./../../config/const');
const Notification = require('./../../models/notificationSchema');
const User = require('./../../models/userSchema');
const Flat = require('./../../models/flatSchema');
const utils = require('./../../config/utils');
const logUtil = require('./../../lib/logUtil');
const EventUser = require('./../../models/eventUser');
const Rx = require('rxjs');
const Operators = require('rxjs/operators');
const router = express.Router();
let flagCreateNotificationSuccessInitial = null;
let flagCreateNotificationSuccess = new Rx.BehaviorSubject(flagCreateNotificationSuccessInitial);
let flagCreateNotificationSuccess$ = flagCreateNotificationSuccess.asObservable();

async function pushNotification(notificationDto, employeeID, buildingID) {
    let listEventUseID = [];
    let listEventEmployeeID = [];
    let queryEmployee = await Employee.find({
        buildingID: buildingID,
        roles: { $in: [CONST.ROLES.ADMIN, CONST.ROLES.RCN] },
        status: { $in: [CONST.STATUS.ACTIVE, CONST.STATUS.WAIT_ACTIVE] }
    });
    queryEmployee.forEach(e => {
        listEventEmployeeID.push(e._id);
    })
    if (notificationDto.notifyScope.type == CONST.SCOPE_NOTIFICATION.ALL) {
        let query = await User.aggregate([
            {
                $match: { // filter only those posts in september
                    $and: [
                        { buildingID: buildingID },
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
            listEventUseID.push(e._id);
        })
    }
    if (notificationDto.notifyScope.type == CONST.SCOPE_NOTIFICATION.BUILDING) {
        let listBuilding = notificationDto.notifyScope.refs;
        logUtil.error(listBuilding);
        let query = await User.aggregate([
            {
                $match: { // filter only those posts in september
                    $and: [
                        { buildingID: buildingID },
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
                    listEventUseID.push(e._id);
                }
            }
        })

    }
    if (notificationDto.notifyScope.type == CONST.SCOPE_NOTIFICATION.FLAT) {
        let flatScope = notificationDto.notifyScope.refs;
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
            listEventUseID.push(e._id);
        })
    }
    let listUserID = [...listEventUseID, ...listEventEmployeeID];
    let rxjsListUserID = Rx.from(listUserID);
    let countInsert = 0;
    rxjsListUserID.pipe(
        Operators.map(data => data),
        Operators.concatMap(async res => {
            let newItem = {
                title: notificationDto.title,
                content: notificationDto.content,
                buildingID,
                userID: res,
                parentNotificationID: notificationDto.id,
                createdBy: employeeID,
                dataType: CONST.DATA_TYPE.NOTIFICATION,
            }
            let newEvent = new EventUser(newItem);
            let save = newEvent.save();
            return Rx.of({ save })
        })
    ).subscribe(data => {
        countInsert++;
        if (countInsert == listUserID.length) {
            flagCreateNotificationSuccess.next(true);
        }
    })
    logUtil.error(listUserID);

}

router.post('/create', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const Auth = req.user;
    const employeeID = Auth.id;
    try {
        let employee = await Employee.findById(employeeID);
        if (!employee) {
            return res.status(400).json({
                status: 1,
                msg: 'Khong tim thay thong tin user'
            })
        }
        employee = employee.toJSON();
        let { title, content, priority, file, notifyScope, status } = req.body;
        let body = {
            title,
            content,
            priority,
            file,
            notifyScope,
            status,
            buildingID: employee.buildingID,
            created: Date.now,
            titleKhongDau: utils.locDau(title),
            createdBy: employeeID,
        }
        let newNotification = new Notification(body);

        newNotification.save()
            .then(async notification => {
                body.id = notification._id;
                await pushNotification(body, employeeID, employee.buildingID);
                return res.status(200).json({
                    msg: 'Tao thong bao thanh cong',
                    status: 0,
                    data: body,
                })
            })


    } catch (err) {
        return res.status(500).json({
            status: -1,
            msg: 'Co loi xay ra, vui long thu lai sau'
        })
    }
})
module.exports = router;