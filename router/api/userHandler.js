const express = require('express');

const router = express.Router();
const Employee = require('./../../models/employeeSchema');
const Building = require('./../../models/buildingSchema');
const User = require('./../../models/userSchema');
const Flat = require('./../../models/flatSchema');
const utils = require('../../config/utils');
const passport = require('passport');
const constant = require('./../../config/const');
const bcrypt = require('bcryptjs');
router.post('/register', async (req, res) => {
    let { flatCode, fullName, phone, password } = req.body;
    try {
        let flatInfomation = await Flat.findOne({ flatCode: flatCode });
        if (!flatInfomation) {
            return res.status(400).json({
                msg: 'Khong tim thay can ho',
                status: 1
            })
        } else {
            flatInfomation = flatInfomation.toJSON();
            let userExists = await User.findOne({ phone: phone });
            if (userExists) {
                return res.status(400).json({
                    status: 1,
                    msg: 'So dien thoai nay da duoc su dung'
                })
            } else {
                let payload = {
                    flatID: flatInfomation.id,
                    buildingID: flatInfomation.buildingID,
                    fullName,
                    phone,
                    password,
                    fullNameKhongDau: utils.locDau(fullName),
                    status: constant.STATUS.WAIT_ACTIVE,
                    created: Date.now,
                    soPhong: flatInfomation.soPhong,
                }
                let newUser = new User(payload);
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => res.json({
                                status: 0,
                                msg: 'Dang ky su dung thanh cong',
                                data: user
                            }))
                            .catch(err => console.log(err));
                    })
                })
            }
        }
    } catch (err) {
        return res.status(500).json({
            msg: 'Co loi xay ra, vui long thu lai sau',
            status: -1,
        })
    }

})

module.exports = router;