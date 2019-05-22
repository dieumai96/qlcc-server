const express = require('express');
const Employee = require('./../../models/employeeSchema');
const passport = require('passport');
const CONST = require('./../../config/const');
const Notification = require('./../../models/notificationSchema');
// const EventEmployee = require('./../../models/eventEmployee'); 
const User = require('./../../models/userSchema');
const utils = require('./../../config/utils');
const router = express.Router();

async function pushNotification(notificationDto, employeeID, buildingID) {
    console.log("buildingID", buildingID);
    let listEventUseID = [];
    if (notificationDto.notifyScope.type == CONST.SCOPE_NOTIFICATION.ALL) {
        let query = await User.aggregate([
            {
                $match: { // filter only those posts in september
                    $and: [
                        { buildingID: buildingID },
                    ]
                },


            }
        ])
        console.log(query);

    }
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

        // let save = await newNotification.save();
        pushNotification(body, employeeID, employee.buildingID);
        return res.status(200).json({
            msg: 'Tao thong bao thanh cong',
            status: 0,
            data: body,
        })
    } catch (err) {
        return res.status(500).json({
            status: -1,
            msg: 'Co loi xay ra, vui long thu lai sau'
        })
    }
})
module.exports = router;