const express = require('express');

const router = express.Router();
const Employee = require('./../../models/employeeSchema');
const Building = require('./../../models/buildingSchema');
const passport = require('passport');
router.post('/create', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
        employee = employee.toJSON();
        if (!employee.roles.includes("ROOT")) {
            return res.status(400).json({
                status: -1,
                msg: 'Ban khong co quyen thuc hien thao tac nay'
            })
        }
        let { image, name, code, status, hotline, blocks, totalFlat, address } = req.body;
        let building = await Building.findOne({ code: code });
        if (building) {
            return res.status(400).json({
                status: 1,
                msg: 'Ma toa nha nay da ton tai',
            })
        } else {
            let buildingDto = new Building({
                image,
                name,
                code,
                status,
                hotline,
                blocks,
                totalFlat,
                address,
                createdBy: employeeID,
                created: Date.now
            })
            let save = await buildingDto.save();
            return res.status(200).json({
                status: 0,
                msg: 'Them toa nha thanh cong',
                data: save
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: -1,
            msg: 'Co loi he thong xay ra'
        })
    }

})

module.exports = router;