const http = require('http');
const mongoose = require('mongoose');
const app = require('./src');
const socket = require('./src/router/api/socketHandler')
const port = process.env.PORT || 3000;

// async function init() {
//     try {
//         const isConnected = await mongoose.connect(`mongodb://localhost/express-qlcc-version2`
//             , {
//                 useNewUrlParser: true,
//                 useCreateIndex: true,
//             });
//         if (!isConnected) {
//             throw new Error(`mongodb connection failed...`);
//         }
//         server.listen(port, () =>
//             console.log(`server running on port ${port}...`)
//         );
//         console.log(`connecting to mongodb...`);
//     } catch (error) {
//         throw error.message;
//     }
// }
// init();
mongoose.connect(`mongodb://localhost/qlcc-server`)
    .then(res => console.log('Connected MongoDB'))
    .catch(err => console.log(err));
// socket.init('http://localhost'); 
app.listen(port, () => {
    socket.init();
    console.log(`Server in running in port ${port}`);
})