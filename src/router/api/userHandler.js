const express = require('express');

const router = express.Router();
const User = require('./../../models/userSchema');
const Flat = require('./../../models/flatSchema');
const utils = require('../../config/utils');
const passport = require('passport');
const constant = require('./../../config/const');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('./../../config/keys');
router.post('/register', async (req, res) => {
    let { flatCode, fullName, phone, password } = req.body;
    try {
        let flatInfomation = await Flat.findOne({ code: flatCode });
        console.log(flatInfomation);
        if (!flatInfomation) {
            return res.status(400).json({
                msg: 'Khong tim thay can ho',
                status: 1
            })
        } else {
            let userExists = await User.findOne({ phone: phone });
            if (userExists) {
                return res.status(400).json({
                    status: 1,
                    msg: 'So dien thoai nay da duoc su dung'
                })
            } else {
                let payload = {
                    flatID: flatInfomation._id,
                    buildingID: flatInfomation.buildingID,
                    fullName,
                    phone,
                    password,
                    fullNameKhongDau: utils.locDau(fullName),
                    status: constant.STATUS.WAIT_ACTIVE,
                    userType: constant.USER_TYPE.USER,
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

router.post('/login', async (req, res) => {
    try {
        let { phone, password } = req.body;
        let findUser = await User.aggregate([
            { $match: { phone: phone, status: { $in: [1, 2] } } },
        ]);
        if (findUser.length) {
            let user = findUser[0];
            let payload = {
                id: user._id,
                fullName: user.fullName,
                date: Date.now,
                phone: user.phone,
                userType: user.userType,
            }
            bcrypt.compare(password, user.password).then(isMatch => {
                console.log("SAO DEO VAO DAY", isMatch);
                if (isMatch) {
                    jwt.sign(
                        payload,
                        keys.secretOnKey,
                        {
                            expiresIn: (Math.floor(new Date().getTime() / 1000) + (7 * 24 * 60 * 60)) * 1000
                        },
                        (err, token) => {
                            delete user.password;
                            res.status(200).json({
                                status: 0,
                                token: token,
                                data: user
                            })
                        }
                    )
                } else {
                    return res.status(400).json({
                        msg: 'Thong tin dang nhap khong chinh xac',
                        status: 1,
                    })
                }
            }, err => {
                return res.status(500).json({
                    msg: 'Co loi xay ra, vui long thu lai sau',
                    status: -1,
                })
            })

        } else {
            return res.status(400).json({
                msg: 'Khong tim thay thong tin nguoi dung',
                status: 1
            })
        }
    } catch (err) {
        return res.status(500).json({
            msg: 'Co loi xay ra, vui long thu lai sau',
            status: -1,
        })
    }
})


// ca nhan cap nhat thong tin 
router.post('/edit', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const user = req.user;
    const userID = user.id;
    try {
        let user = await User.findById(userID);
        if (user) {
            user = user.toJSON();
            if (user.status == constant.STATUS.REJECT || user.status == constant.STATUS.DELETE) {
                return res.status(400).json({
                    status: 1,
                    msg: 'Tai khoan cua ban da bi khoa, vui long lien he voi ban quan ly'
                })
            }
            let { fullName, homeOwner, hobby, avatar } = req.body;
            user.fullName = fullName ? fullName : user.fullName;
            user.homeOwner = homeOwner ? homeOwner : user.homeOwner;
            user.hobby = hobby ? hobby : user.hobby;
            user.avatar = avatar ? avatar : user.avatar;
            User.updateOne({ _id: userID }, {
                $set: user,
                $currentDate: { lastModified: true }
            }, function (err, res1) {
                if (err) {
                    return res.status(400).json({
                        status: 1,
                        msg: err,
                    })
                }
                return res.status(200).json({
                    status: 0,
                    msg: 'Cap nhat thong tin thanh cong'
                })
            })
        } else {
            return res.status(400).json({
                status: 1,
                msg: 'Khong tim thay thong tin user'
            })
        }

    } catch (err) {
        return res.status(500).json({
            msg: 'Co loi xay ra, vui long thu lai sau',
            status: -1,
        })
    }
})
module.exports = router;