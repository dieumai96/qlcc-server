const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const log = require('./lib/logUtil');
const socket = require('./router/api/socketHandler')
const port = process.env.PORT || 3000;

mongoose.connect(`mongodb://localhost/express-qlcc-version2`)
    .then(res => console.log('Connected MongoDB'))
    .catch(err => console.log(err));
app.listen(port, () => {
    socket.init();
    console.log(`Server in running in port ${port}`);
})