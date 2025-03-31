//this file will handle the connection logic to the database

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://127.0.0.1:27017/TaskManager', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log(" Connected to MongoDB");
})
.catch((e) => {
    console.error(" Error while attempting to connect to DB:", e);
});

module.exports = { mongoose };
