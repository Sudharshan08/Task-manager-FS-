//load in mongoose models
//const {List} = require('./db/models/list.model');
//const {Task} = require('./db/models/task.model');
const { List } = require('./list.model');
const { Task } = require('./task.model');


module.exports = {
    List,
    Task
};