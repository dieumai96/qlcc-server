const express = require('express');

const router = express.Router();
const Employee = require('./../../models/employeeSchema');
const Building = require('./../../models/buildingSchema');
const utils = require('./../../config/utils');
const constant = require('./../../config/const');
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
        building = building.toJSON();
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
                    status: constant.STATUS.ACTIVE
                })
                let newFlat = await flatDto.save();
                return res.status(200).json({
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
    let { flatsDto } = req.body;
    console.log(flatsDto);
    try {
        let employee = await Employee.findById(employeeID);
        if (!employee) {
            return res.status(400).json({
                status: 1,
                msg: 'Khong tim thay thong tin user'
            })
        }
        if (!employee.roles.includes("ADMIN")) {
            return res.status(400).json({
                status: 1,
                msg: 'Ban khong co quyen thuc hien thao tac nay'
            })
        }
        let building = await Building.findById(employee.buildingID);
        console.log("emp", building);
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
                    console.log(building.blocks);
                    if (!building.blocks.includes(res.block)) {
                        failItem += 1;
                        return Rx.of({ status: 1, failItem })
                    } else {
                        let genCode = await utils.genCode(5);
                        let code = building.code + genCode;
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
                                createdBy: employeeID,
                                buildingID: employee.buildingID,
                                code: code.toUpperCase(),
                                status: constant.STATUS.ACTIVE
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

router.post('/edit', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const Auth = req.user;
    const employeeID = Auth.id;
    let { flatID, block, soPhong, owerName, phone, acreage, flatType, note, status } = req.body;

    try {
        let employee = await Employee.findById(employeeID);
        if (!employee) {
            return res.status(200).json({
                status: 1,
                msg: 'Khong tim thay thong tin user'
            })
        }
        employee = employee.toJSON();
        if (!employee.roles.includes("ADMIN")) {
            return res.status(200).json({
                status: 1,
                msg: 'Ban khong co quyen thuc hien thao tac nay'
            })
        }
        let building = await Building.findById(employee.buildingID);
        if (!building) {
            return res.status(200).json({
                msg: 'Ban khong thuoc pham vi toa nha nao',
                status: 1
            })
        }
        let flat = await Flat.findById(flatID);
        if (!flat) {
            return res.status(200).json({
                msg: 'Khong tim thay can ho',
                status: 1
            })
        } else {
            flat.block = block ? block : flat.block;
            flat.soPhong = soPhong ? soPhong : flat.soPhong;
            flat.owerName = owerName ? owerName : flat.owerName;
            flat.phone = phone ? phone : flat.phone;
            flat.acreage = acreage ? acreage : flat.acreage;
            flat.flatType = flatType ? flatType : flat.flatType;
            flat.note = note ? note : flat.note;
            flat.status = status ? status : flat.status;
            let conditionExistsFlat = { block: flat.block, soPhong: flat.soPhong };
            let findFlat = await Flat.find(conditionExistsFlat);

            if (!findFlat.length) {
                return res.status(200).json({
                    msg: 'Thong tin can ho nay da ton tai roi',
                    status: 1,
                })
            } else {
                Flat.updateOne({ _id: flatID }, { $set: flat }, function (err, res1) {
                    if (err) {
                        return res.status(200).json({
                            status: 1,
                            msg: err,
                        })
                    }
                    return res.status(200).json({
                        status: 0,
                        msg: 'Cap nhat thong tin can ho thanh cong'
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


router.post('/getAll', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
        // if (!employee.roles.includes("ADMIN")) {
        //     return res.status(400).json({
        //         status: 1,
        //         msg: 'Ban khong co quyen thuc hien thao tac nay'
        //     })
        // }
        let building = await Building.findById(employee.buildingID);
        console.log(building)
        if (!building) {
            return res.status(400).json({
                msg: 'Ban khong thuoc pham vi toa nha nao',
                status: 1
            })
        }
        let allFlat = await Flat.aggregate([
            { $match: { status: { $in: [1, 2] } } },

            {
                $lookup:
                {
                    from: "employees",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "employee_info"
                },
            },

            {
                $lookup:
                {
                    from: "buildings",
                    localField: "buildingID",
                    foreignField: "_id",
                    as: "building_info"
                }
            },

            {
                $lookup:
                {
                    from: 'users',
                    localField: "_id",
                    foreignField: "flatID",
                    as: "listUser"
                }
            },
            {
                $sort: {
                    "timeCreated": -1
                }
            }
        ])
        if (allFlat) {
            allFlat.forEach(e => {
                if (e.employee_info) {
                    e.employee_info.forEach(el => {
                        delete el.password;
                    })
                }
            })
        }
        return res.status(200).json({
            status: 0,
            data: allFlat,
            totalFlat: allFlat.length,
            msg: 'Lay danh sach can ho thanh cong'
        })
    } catch (err) {
        return res.status(500).json({
            msg: 'Co loi xay ra, vui long thu lai sau',
            status: -1,
        })
    }
})


router.post('/getFlatByID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const Auth = req.user;
    const employeeID = Auth.id;
    let { flatID } = req.body;
    console.log(flatID)
    try {
        let employee = await Employee.findById(employeeID);
        if (!employee) {
            return res.status(400).json({
                status: 1,
                msg: 'Khong tim thay thong tin user'
            })
        }
        employee = employee.toJSON();
        let building = await Building.findById(employee.buildingID);
        if (!building) {
            return res.status(400).json({
                msg: 'Ban khong thuoc pham vi toa nha nao',
                status: 1
            })
        }
        let flat = await Flat.aggregate([
            {
                $match: {
                    $and: [
                        { status: { $in: [1, 2] } }
                    ]
                },
            },


            {
                $lookup:
                {
                    from: "buildings",
                    localField: "buildingID",
                    foreignField: "_id",
                    as: "building_info"
                }
            },

            {
                $lookup:
                {
                    from: 'users',
                    localField: "_id",
                    foreignField: "flatID",
                    as: "listUser"
                }
            },

        ])
        flat = flat.filter(x => x._id == flatID);
        if (flat.length) {
            flat.forEach(e => {
                if (e.employee_info) {
                    e.employee_info.forEach(el => {
                        delete el.password;
                    })
                }
            })
        }
        return res.status(200).json({
            status: 0,
            data: flat
        })
    } catch (err) {
        return res.status(500).json({
            msg: 'Co loi xay ra, vui long thu lai sau',
            status: -1,
        })
    }
})


router.post('/deleteFlat', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const Auth = req.user;
    const employeeID = Auth.id;
    let { flatID } = req.body;
    try {
        let employee = await Employee.findById(employeeID);
        if (!employee) {
            return res.status(400).json({
                status: 1,
                msg: 'Khong tim thay thong tin user'
            })
        }
        employee = employee.toJSON();
        let building = await Building.findById(employee.buildingID);
        if (!building) {
            return res.status(400).json({
                msg: 'Ban khong thuoc pham vi toa nha nao',
                status: 1
            })
        }
        let flat = await Flat.findById(flatID);
        if (flat) {
            await Flat.findOneAndRemove({ "_id": flatID })
            return res.status(200).json({
                status: 0,
                msg: 'Xoa can ho thanh cong',
            })
        } else {
            return res.status(400).json({
                status: 1,
                msg: 'Khong tim thay thong tin can ho',
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