const express = require('express');
const Employee = require('./../../models/employeeSchema');
const passport = require('passport');
const CONST = require('./../../config/const');
const Building = require('./../../models/buildingSchema');
const utils = require('./../../config/utils');
const logUtils = require('./../../lib/logUtil')
const Roles = require('./../../models/roleSchema');
const router = express.Router();

router.post('/getAll', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    const Auth = req.user;
    const employeeID = Auth.id;
    try {
        if (utils.checkTokenExpired(req.headers.authorization)) {
            let employee = await Employee.findById(employeeID);
            if (!employee) {
                return res.status(400).json({
                    status: 1,
                    msg: 'Khong tim thay thong tin user'
                })
            } else {
                let roles = await Roles.aggregate([
                    {
                        $match: {
                            $and: [
                                { buildingID: employee.buildingID },
                                { status: { $in: [1, 2] } },
                            ]
                        },
                    },
                ])
                return res.status(200).json({
                    msg: 'Lấy danh sách vai trò thành công',
                    data: roles
                })
            }

        } else {
            return res.status(500).json({
                status: -1,
                msg: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
            })
        }

    } catch (err) {
        return res.status(500).json({
            status: -1,
            msg: 'Co loi xay ra, vui long thu lai sau'
        })
    }
})


router.post('/create', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    const Auth = req.user;
    const employeeID = Auth.id;
    let { code, name, description } = req.body;
    let token = req.headers.authorization;
    logUtils.error("======> payload", req.body);
    logUtils.error("=====Token", req.headers.authorization)
    try {
        if (utils.checkTokenExpired(token)) {
            let employee = await Employee.findById(employeeID);
            if (!employee) {
                return res.status(400).json({
                    status: 1,
                    msg: 'Khong tim thay thong tin user'
                })
            } else {
                let query = {
                    code,
                    buildingID: employee.buildingID,
                }
                logUtils.error("query======>", query);

                let findRole = await Roles.find(query);
                logUtils.error("findRoles", findRole);
                if (findRole.length) {
                    return res.status(400).json({
                        status: 1,
                        msg: 'Vai trò này đã tồn tại',
                    })
                } else {
                    let body = {
                        code: code.toUpperCase(),
                        name,
                        description,
                        buildingID: employee.buildingID,
                        status: CONST.STATUS.ACTIVE,
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
        } else {
            return res.status(500).json({
                status: -1,
                msg: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
            })
        }

    } catch (err) {
        return res.status(500).json({
            status: -1,
            msg: 'Co loi xay ra, vui long thu lai sau'
        })
    }
})

module.exports = router;