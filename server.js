const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const port = process.env.PORT || 3000;
const server = http.createServer(app);

mongoose.Promise = require('bluebird');
// Connecting to mongodb

async function init() {
    try {
        const isConnected = await mongoose.connect(`mongodb://localhost/express`
            , {
                useNewUrlParser: true,
                useCreateIndex: true,
            });
        if (!isConnected) {
            throw new Error(`mongodb connection failed...`);
        }
        server.listen(port, () =>
            console.log(`server running on port ${port}...`)
        );
        console.log(`connecting to mongodb...`);
    } catch (error) {
        throw error.message;
    }
}
init();