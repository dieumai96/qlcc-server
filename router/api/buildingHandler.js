const express = require('express');

const router = express.Router();
const Employee = require('./../../models/employeeSchema');
const Building = require('./../../models/buildingSchema');
const Roles = require('./../../models/roleSchema');
const CONST = require('./../../config/const');

const passport = require('passport');

class RolesModel {
    code;
    name;
    description;
    constructor(
        code, name, description
    ) {
        this.code = code;
        this.name = name;
        this.description = description;
    }
}

const employeeInfo = async employeeId => {
    try {
        const employee = await Employee.findById(employeeId);
        if (employee) {
            return;
        }
        return employee;
    } catch (err) {
        throw err;
    }
};

router.post('/create', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const Auth = req.user;
    const employeeID = Auth.id;
    console.log("user", Auth);
    try {
        let employee = await Employee.findById(employeeID);
        console.log("thong tin", employee);
        if (!employee) {
            return res.status(400).json({
                status: 1,
                msg: 'Khong tim thay thong tin user'
            })
        }
        if (!employee.roles.includes("ROOT")) {
            return res.status(400).json({
                status: 1,
                msg: 'Ban khong co quyen thuc hien thao tac nay'
            })
        }
        let { image, name, code, status, hotLine, blocks, totalFlat, address } = req.body;
        let building = await Building.findOne({ code: code });
        if (building) {
            return res.status(400).json({
                status: 1,
                msg: 'Ma toa nha nay da ton tai',
            })
        } else {
            let dtoRoles = [
                { name: 'Bộ phận quản trị', roles: CONST.ROLES.ADMIN, description: 'Ban quản trị của toà nhà' },
                { name: 'Bộ phận tiếp nhận', roles: CONST.ROLES.RCN, description: 'Bộ phận tiếp nhận của toà nhà' },
                { name: 'Bộ phận thu ngân', roles: CONST.ROLES.TN, description: 'Bộ phận thu ngân của toà nhà' },
            ]

            let buildingDto = new Building({
                image,
                name,
                code,
                status,
                hotLine: hotLine,
                blocks,
                totalFlat,
                address,
                createdBy: employeeID,
            })
            let save = await buildingDto.save();
            return res.status(200).json({
                status: 0,
                msg: 'Them toa nha thanh cong',
                data: buildingDto
            })
        }
    } catch (error) {
        return res.status(500).json({
            status: -1,
            err: error,
            msg: 'Co loi he thong xay ra'
        })
    }

})


router.post('/update', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
        if (!employee.roles.includes("ROOT")) {
            return res.status(400).json({
                status: 1,
                msg: 'Ban khong co quyen thuc hien thao tac nay'
            })
        }
        console.log(employee);
        let { buildingID, image, name, status, hotline, blocks, totalFlat, address } = req.body;
        const buildingExists = await Building.findById(buildingID);

        if (!buildingExists) {
            return res.status(400).json({
                msg: 'Khong tim thay toa nha',
                status: 1,
            })
        }
        // buildingExists = buildingExists.toJSON();
        console.log(buildingExists.name);
        buildingExists.image = image ? image : buildingExists.image;
        buildingExists.name = name ? name : buildingExists.name;
        buildingExists.status = status ? status : buildingExists.status;
        buildingExists.hotline = hotline ? hotline : buildingExists.hotline;
        buildingExists.blocks = blocks ? blocks : buildingExists.blocks;
        buildingExists.totalFlat = totalFlat ? totalFlat : buildingExists.totalFlat;
        buildingExists.address = address ? address : buildingExists.address;
        Building.updateOne({ _id: buildingID }, {
            $set: buildingExists,
        }, function (err, res1) {
            if (err) {
                return res.status(400).json({
                    status: 1,
                    msg: err,
                })
            }
            return res.status(200).json({
                status: 0,
                msg: 'Cap nhat thong tin toa nha thanh cong'
            })
        })
        console.log(buildingExists)
    } catch (err) {
        return res.status(500).json({
            status: -1,
            msg: 'Co loi xay ra, vui long thu lai sau',
            err: err,
        })
    }
})

router.post("/getAll", passport.authenticate('jwt', { session: false }), async (req, res) => {
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
                status: 1,
                msg: 'Ban khong co quyen thuc hien thao tac nay'
            })
        }
        let allBuildings = await Building.aggregate([
            {
                $lookup:
                {
                    from: "employees",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "createdInfo"
                }
            }
        ]);
        return res.status(200).json({
            status: 0,
            msg: 'Lay danh sach chung cu thanh cong',
            data: allBuildings
        })
    } catch (err) {
        return res.status(500).json({
            status: -1,
            msg: 'Co loi xay ra, vui long thu lai sau',
            err: err,
        })
    }
})
module.exports = router;