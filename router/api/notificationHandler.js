const express = require('express');

const router = express.Router();
const User = require('./../../models/userSchema');
const Flat = require('./../../models/flatSchema');
const utils = require('../../config/utils');
const passport = require('passport');
const constant = require('./../../config/const');
const jwt = require('jsonwebtoken');
const keys = require('./../../config/keys');




module.exports = router;