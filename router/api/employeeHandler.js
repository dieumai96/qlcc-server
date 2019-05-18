const bcrypt = require('bcryptjs');
const express = require('express');
const Employee = require('./../../models/employeeSchema');
const jwt = require('jsonwebtoken');
const keys = require('./../../config/keys');
const router = express.Router();

router.post('/employee/create', (req, res, next) => {
    
})

router.post('/employee/login', async (req, res, next) => {
    let { phone, password } = req.body;
    Employee.find({ phone: phone })
        .then(employee => {
            if (employee) {
                if (employee.status == 9) {
                    return res.status(400).json({
                        status: 1,
                        msg: 'Tai khoan cua ban da bi khoa, vui long lien he voi admin'
                    })
                }
                bcrypt.compare(password, employee.password).then(isMatch => {
                    if (isMatch) {
                        const payload = {
                            id: employee.id,
                            fullName: employee.fullName,
                            phone: employee.phone,
                            date: Date.now(),
                            email: employee.email,
                        }
                        jwt.sign(
                            payload,
                            keys.secretOnKey,
                            {
                                expiresIn: (Math.floor(new Date().getTime() / 1000) + (7 * 24 * 60 * 60)) * 1000
                            },
                            (err, token) => {
                                res.status(200).json({
                                    status: 0,
                                    token: token,
                                    data: employee
                                })
                            }
                        )
                    } else {
                        return res.status(400).json({
                            status: 1,
                            msg: 'Mat khau khong chinh xac'
                        })
                    }
                })
            } else {
                return res.status(400).json({
                    status: 1,
                    msg: 'Khong tim thay thong tin nguoi dung'
                })
            }
        }, err => {
            return res.status(500).json({
                status: -1,
                msg: 'Co loi he thong'
            })
        })
})