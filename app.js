const express = require('express');
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');
const bodyParser = require('body-parser');

const app = express();

const fileRoutes = require("./router/api/uploadFile");
const employeeRouter = require('./router/api/employeeHandler');

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
// Handling CORS Errors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT POST PATCH GET DELETE');
        return res.status(200).json({});
    }
    next();
});

app.use("/api/v1/", fileRoutes);
app.use('/api/', employeeRouter);

// Use mongoose promise library

module.exports = app;



// tuhamathan : id account amazon