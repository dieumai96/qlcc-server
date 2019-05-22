const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const port = process.env.PORT || 3000;
const server = http.createServer(app);

// Connecting to mongodb

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
mongoose.connect(`mongodb://localhost/express-qlcc-version2`)
.then(res => console.log('Connected MongoDB'))
.catch(err => console.log(err));

app.listen(port, () => {
    console.log(`Server in running in port ${port}`);
})