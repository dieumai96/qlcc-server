const express = require('express');
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');
const bodyParser = require('body-parser');
var cors = require('cors')
const app = express();

const fileRoutes = require("./router/api/uploadFile");
const employeeRouter = require('./router/api/employeeHandler');
const buildingRouter = require('./router/api/buildingHandler');
const flatRouter = require('./router/api/flatHandler');
const userRouter = require('./router/api/userHandler');
const notificationRouter = require('./router/api/notificationHandler');
const socket = require('./router/api/socketHandler');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
// Use http logger middleware
app.use(morgan('dev'));

// Set static folder
app.use('/public', express.static(path.resolve(__dirname, 'public')));

// Passport middleware
app.use(passport.initialize());
// Passport Config
require('./middleware/passport')(passport);
app.use(cors())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.use("/api/v1/", fileRoutes);
app.use('/api/employee', employeeRouter);
app.use('/api/building', buildingRouter);
app.use('/api/flat', flatRouter);
app.use('/api/user', userRouter);
app.use('/api/notification', notificationRouter);
// Use mongoose promise library

module.exports = app;



// tuhamathan : id account amazon