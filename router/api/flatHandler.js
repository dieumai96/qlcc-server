const express = require('express');

const router = express.Router();
const Employee = require('./../../models/employeeSchema');
const Building = require('./../../models/buildingSchema');
const utils = require('./../../config/utils');
const Flat = require('../../models/flatSchema');
const Rx = require('rxjs');
const Operators = require('rxjs/operators');
const passport = require('passport');



router.post('/create', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const Auth = req.user;
    const employeeID = Auth.id;
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
        let building = await Building.findById(employee.buildingID);
        console.log(building);
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
            let conditionFlatExis = { block, soPhong };
            let existsFlat = await Flat.find(conditionFlatExis);
            if (existsFlat.length) {
                return res.status(200).json({
                    status: 1,
                    msg: 'Can ho nay da ton tai trong he thong'
                })
            } else {
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
                    buildingID: employee.buildingID,
                    code: code.toUpperCase(),
                })
                let newFlat = await flatDto.save();
                return res.status(400).json({
                    msg: 'Them moi can ho thanh cong',
                    status: 0,
                    data: newFlat,
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

router.post('/createMulti', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const Auth = req.user;
    const employeeID = Auth.id;
    let flatsDto = req.body;
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
        let building = await Building.findById(employee.buildingID);
        let failItem = 0;
        let count = 0;
        if (!building) {
            return res.status(400).json({
                msg: 'Ban khong thuoc pham vi toa nha nao',
                status: 1
            })
        } else {
            let observable = Rx.from(flatsDto);
            observable.pipe(
                Operators.map(data => data),
                Operators.concatMap(async res => {
                    if (!building.blocks.includes(res.block)) {
                        failItem += 1;
                        return Rx.of({ status: 1, failItem })
                    } else {
                        let genCode = await utils.genCode(5);
                        let code = res.code + genCode;
                        let conditionFlatExis = { block: res.block, soPhong: res.soPhong };
                        let existsFlat = await Flat.find(conditionFlatExis);
                        if (existsFlat.length) {
                            failItem += 1;
                        } else {
                            let flatDto = new Flat({
                                block: res.block,
                                soPhong: res.soPhong,
                                owerName: res.owerName,
                                phone: res.phone,
                                acreage: res.acreage,
                                flatType: res.flatType,
                                note: res.note,
                                created: Date.now,
                                createdBy: employeeID,
                                buildingID: employee.buildingID,
                                code: code.toUpperCase(),
                            })
                            let save = await flatDto.save();
                            return Rx.of({ save });
                        }
                    }
                })
            ).subscribe(data => {
                count++;
                if (count == flatsDto.length) {
                    return res.status(200).json({
                        msg: 'Them moi can ho thanh cong',
                        status: 0,
                        failItem: failItem
                    })
                }
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