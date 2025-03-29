const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const {mongoose} = require('./db/mongoose');
const cors = require('cors');

//allowing CORS for frontend
app.use(cors({
    origin: 'http://localhost:4200', // Allow only frontend
    methods: 'GET,POST,PATCH,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
  }));

//load in mongoose models
const {List, Task} = require("./db/models");

//load middleware
app.use(bodyParser.json());

//enable cors header middleware
/*app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "YOUR-DOMAIN.TLD"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

/* Route handlers for the code*/

/* List handlers for the code */


/*Get lists*/
app.get("/lists", (req , res)=>{
    //return lists from the database
    List.find({}).then((lists)=>{
        res.send(lists);
    });

});

//additional feature for retreving tasks separately

app.get('/lists/:listId/tasks/:taskId', (req,res)=>{
    Task.findOne({
        _id:req.params.taskId,
        _listId:req.params.listId
    }).then((task)=>{
        res.send(task);
    });
})

/*post lists*/

app.post("/lists", (req,res)=>{
    //return new lists
    let title = req.body.title;

    let newList = new List({
        title
    });
    newList.save().then((listDoc)=>{
        //the full list document returned
        res.send(listDoc);
    });
});

/* Update the lists*/

app.patch("/lists/:id", (req,res)=>{
    //add up new values
    List.findOneAndUpdate({_id: req.params.id}, {
        $set: req.body
    }).then(()=> {
        res.sendStatus(200);
    });
});

/* delete lists */

app.delete("/lists/:id", (req,res)=>{
    //deletes the lists
    List.findOneAndRemove({
        _id:req.params.id
    }).then((removedListDoc)=>{
        res.send(removedListDoc);
    });
});


//retrive specific tasks

/*app.get('/lists/:listId/tasks', (req,res)=>{
    //return all tasks
    Task.find({
        _listId: req.params.listId
    }).then((tasks)=>{
        res.send(tasks);
    })
});*/

//updated code for the get tasks , without crashing the app for undefined 
app.get('/lists/:listId/tasks', (req, res) => {
    const { listId } = req.params;

    if (!listId || !mongoose.Types.ObjectId.isValid(listId)) {
        return res.status(400).json({ error: 'Invalid list ID' });
    }

    Task.find({ _listId: listId })
        .then((tasks) => res.send(tasks))
        .catch((err) => res.status(500).json({ error: err.message }));
});



//app.post("/lists/:listId/tasks", (req,res)=>{
    //for the post req
   // let newTask = new Task({
     //   title:req.body.title,
       // _listId:req.params.listId
   // });
    //newTask.save().then((newTaskDoc)=>{
       // res.send(newTaskDoc);
   // });
//});

//updated code of the post task due to listid error

app.post("/lists/:listId/tasks", (req, res) => {
    const { listId } = req.params;
    const { title } = req.body;

    // Validate listId before using it
    if (!mongoose.Types.ObjectId.isValid(listId)) {
        return res.status(400).json({ error: "Invalid list ID format" });
    }

    // Create a new task with a valid ObjectId
    let newTask = new Task({
        title: title,
        _listId: new mongoose.Types.ObjectId(listId) // Ensure listId is stored as ObjectId
    });

    newTask.save()
        .then((newTaskDoc) => res.status(201).json(newTaskDoc))
        .catch((err) => res.status(500).json({ error: err.message }));
});




//for the update(patch)
app.patch("/lists/:listId/tasks/:taskId", (req,res)=>{
    //for updating existing task
    Task.findOneAndUpdate({
        _id:req.params.taskId,
        _listId:req.params.listId
    }, {
        $set:req.body
    }
).then(()=>{
        res.send({message: 'updated successfully'});
    });
});

//for the delete task
app.delete('/lists/:listId/tasks/:taskId', (req,res)=>{
Task.findOneAndRemove({
    _id:req.params.taskId,
    _listId:req.params.listId
}).then((removedTaskDoc)=>{
    res.send(removedTaskDoc);
});
});




app.listen(3000, ()=>{
    console.log("server started at port 3000");
})