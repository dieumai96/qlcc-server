const express = require('express');

const router = express.Router();
const Employee = require('./../../models/employeeSchema');
const Building = require('./../../models/buildingSchema');
const utils = require('./../../config/utils');
const Flat = require('../../models/flatSchema');
const passport = require('passport');


router.post('/create', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const Auth = req.user;
    const employeeID = Auth.id;
    const buildingID = Auth.buildingID;
    let { block, soPhong, owerName, phone, acreage, flatType, note } = req.body;
    try {
        let employee = await Employee.findById(employeeID);
        if (!employee) {
            return res.status(400).json({
                status: 1,
                msg: 'Khong tim thay thong tin user'
            })
        }
        employee = employee.toJSON();
        if (!employee.roles.includes("ADMIN")) {
            return res.status(400).json({
                status: 1,
                msg: 'Ban khong co quyen thuc hien thao tac nay'
            })
        }
        let building = await Building.findById(buildingID);
        if (!building) {
            return res.status(400).json({
                msg: 'Ban khong thuoc pham vi toa nha nao',
                status: 1
            })
        } else {
            if (!building.blocks.includes(block)) {
                return res.status(400).json({
                    msg: 'Toa nha khong thuoc pham vi cua chung cu',
                    status: 1,
                })
            }
            let genCode = await utils.genCode(5);
            let code = building.code + genCode;
            let flatDto = new Flat({
                block,
                soPhong,
                owerName,
                phone,
                acreage,
                flatType,
                note,
                created: Date.now,
                createdBy: employeeID,
                buildingID,
                code: code.toUpperCase(),
            })
            let newFlat = await flatDto.save();
            return res.status(400).json({
                msg: 'Them moi can ho thanh cong',
                status: 0,
                data: newFlat,
            })
        }
    } catch (err) {
        return res.status(500).json({
            msg: 'Co loi xay ra, vui long thu lai sau',
            status: -1,
        })
    }
})