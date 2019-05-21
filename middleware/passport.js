const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Employee = require('./../models/employeeSchema');
const User = require('./../models/userSchema');
const constant = require('./../config/const');
const keys = require('./../config/keys');


const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOnKey;
module.exports = passport => {
    passport.use(
        new JwtStrategy(opts, (jwt_payload, done) => {
            console.log(jwt_payload);
            if (jwt_payload.userType == `'${constant.USER_TYPE.EMPLOYEE}'`) {
                Employee.findById(jwt_payload.id)
                    .then(employee => {
                        if (employee) {
                            return done(null, employee);
                        }
                        return done(null, false);
                    })
                    .catch(err => console.log(err));
            } else {
                User.findById(jwt_payload.id)
                    .then(user => {
                        if (user) {
                            return done(null, user);
                        }
                        return done(null, false);
                    })
                    .catch(err => console.log(err));
            }

        })
    );
};
