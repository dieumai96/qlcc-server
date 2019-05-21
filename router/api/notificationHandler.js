const bcrypt = require('bcryptjs');
const express = require('express');
const Employee = require('./../../models/employeeSchema');
const jwt = require('jsonwebtoken');
const keys = require('./../../config/keys');
const passport = require('passport');
const CONST = require('./../../config/const');
const Building = require('./../../models/buildingSchema');
const Notification = require('./../../models/notificationSchema');
const utils = require('./../../config/utils');
const router = express.Router();


router.post('/create', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const Auth = req.user;
    const employeeID = Auth.id;
    const buildingID = Auth.buildingID;
    console.log(Auth.buildingID);
    try {
        let employee = await Employee.findById(employeeID);
        if (!employee) {
            return res.status(400).json({
                status: 1,
                msg: 'Khong tim thay thong tin user'
            })
        }
        let { title, content, priority, file, notifyScope, status } = req.body;
        let body = {
            title,
            content,
            priority,
            file,
            notifyScope,
            status,
            buildingID,
            created: Date.now,
            titleKhongDau: utils.locDau(title),
            createdBy: employeeID,
        }
        let newNotification = new Notification(body);

        let save = newNotification.save();
        return res.status(200).json({
            msg: 'Tao thong bao thanh cong',
            status: 0,
            data : body,
        })
    } catch (err) {
        return res.status(500).json({
            status: -1,
            msg: 'Co loi xay ra, vui long thu lai sau'
        })
    }
})
module.exports = router;