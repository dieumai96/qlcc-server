const express = require('express');
const Employee = require('./../../models/employeeSchema');
const passport = require('passport');
const CONST = require('./../../config/const');
const Building = require('./../../models/buildingSchema');
const utils = require('./../../config/utils');
const logUtils = require('./../../lib/logUtil')
const Roles = require('./../../models/roleSchema');
const router = express.Router();

router.post('/create', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    const Auth = req.user;
    const employeeID = Auth.id;
    let { code, name, description } = req.body;
    logUtils.error("======> payload", req.body);
    try {
        let employee = await Employee.findById(employeeID);
        if (!employee) {
            return res.status(400).json({
                status: 1,
                msg: 'Khong tim thay thong tin user'
            })
        } else {
            if (!(employee.roles.includes(CONST.ROLES.ADMIN) || employee.roles.includes(CONST.ROLES.RCN))) {
                return res.status(400).json({
                    status: 1,
                    msg: CONST.MESSAGE.PERMISION
                })
            } else {
                let body = {
                    code,
                    name,
                    description,
                    buidingID: employee.buidingID,
                }
                let role = new Roles(body);
                role.save()
                    .then(role => res.json({
                        status: 0,
                        msg: 'Thêm vai trò mới thành công',
                        data: role
                    }))
                    .catch(err => {
                        return res.status(400).json({
                            status: -1,
                            msg: 'Co loi xay ra, vui long thu lai sau',
                            err: err
                        })
                    });
            }
        }
    } catch (err) {
        return res.status(500).json({
            status: -1,
            msg: 'Co loi xay ra, vui long thu lai sau'
        })
    }
})
module.exports = router;