//this file will handle the connection logic to the database

/*const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TaskManager', {useNewUrlParser : true}).then(()=>{
    console.log("Connected to mongodb");
}).catch((e)=>{
    console.log("error while attempting to connect to db");
    console.log(e);
});

//to avoid warnings
//mongoose.set('useCreateIndex', true);
//mongoose.set('useFindAndModify', true);

module.exports = {
    mongoose
}; */


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
