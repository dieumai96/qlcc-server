const bcrypt = require('bcryptjs');
const express = require('express');
const Employee = require('./../../models/employeeSchema');
const jwt = require('jsonwebtoken');
const keys = require('./../../config/keys');
const passport = require('passport');
const CONST = require('./../../config/const');
const router = express.Router();

// router.post('/employee/create', passport.authenticate('jwt', { session: false }), (req, res, next) => {
router.post('/employee/create', (req, res) => {

    let Auth = req.user;
    let id = Auth.id;
    let { phone, password, email, birthDate, roles, note } = req.payload;
    // Employee.findById(id)
    //     .then(employee => {
    // if (!employee) {
    //     return res.status(400).json({
    //         status: 1,
    //         msg: 'Khong tim thay nhan vien'
    //     })
    // }
    // if (!employee.roles.includes("ADMIN") || !employee.roles.includes("ROOT")) {
    //     return res.status(400).json({
    //         status: 1,
    //         msg: 'Ban khong co quyen thuc hien thao tac nay'
    //     })
    // }
    let payload = {
        phone,
        email,
        birthDate,
        roles,
        note,
        password,
        created: Date.now(),
        status: CONST.STATUS.ACTIVE
    }
    Employee.find({ phone: phone })
        .then(exists => {
            if (exists) {
                return res.status(400).json({
                    status: 1,
                    msg: 'Nguoi dung nay da ton tai'
                })
            } else {
                let newEmployee = new Employee(payload);
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newEmployee.password, salt, (err, hash) => {
                        if (err) throw err;
                        newEmployee.password = hash;
                        newEmployee
                            .save()
                            .then(employee => res.json({
                                status: 0,
                                msg: 'Them moi nhan vien thanh cong',
                                data: employee
                            }))
                            .catch(err => console.log(err));
                    })
                })
            }
        }, err => {
            return res.status(500).json({
                status: 1,
                msg: 'Co loi he thong xay ra',
                err: err
            })
        })
    // }
    // , err => {
    //     return res.status(500).json({
    //         status: 1,
    //         msg: 'Co loi he thong xay ra',
    //         err: err
    //     })
    // })
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