const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const { mongoose } = require('./db/mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
//const { User } = require("./db/models/User");

//middleware to parse json content
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


//allowing CORS for frontend
app.use(cors({
    origin: 'http://localhost:4200', // Allow only frontend
    methods: 'GET,POST,PATCH,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization,x-refresh-token,x-access-token',
    exposedHeaders: 'x-access-token, x-refresh-token'
}));

app.use((req, res, next) => {
    res.header('Access-Control-Expose-Headers', 'x-access-token, x-refresh-token','_id');
    next();
});

//load in mongoose models
//user inside of this code if future error
const { List, Task, User } = require("./db/models");

//load middleware
app.use(bodyParser.json());

/* Route handlers for the code*/
/* List handlers for the code */

//check whether the req has a valid jwt 
let authenticate = (req,res,next)=>{
    //modify the below line for x-refresh-token if future error
    let token = req.header('x-access-token');
    
    //verify jwt
    jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
        if (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({ error: "Token expired. Please refresh your token." });
            }
            return res.status(401).json({ error: "Invalid authentication token" });
        }
    
        req.user_id = decoded._id;
        next();
    });
}


//verify refresh token middleware

let verifySession = (req,res,next)=>{
    let refreshToken = req.header('x-refresh-token');
    let _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user)=>{
        if(!user){
            return Promise.reject({
                'error': 'User not found'
            });
        }
        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;
        
        let session = user.sessions.find(s => s.token === refreshToken);
        if (!session || User.hasRefreshTokenExpired(session.expiresAt)) {
            return res.status(401).json({ error: "Refresh token expired. Please log in again." });
        }

        if(isSessionValid){
            next();
        }else{
            return Promise.reject({
                'error':'Refresh token expired'
            })
        }
    }).catch((e)=>{
        res.status(401).send(e);
});
}

/*Get lists*/
app.get("/lists", authenticate, (req, res) => {
    //return lists from the database
    List.find({
        _userId:req.user_id
    }).then((lists) => {
        res.send(lists);
    }).catch((e)=>{
        res.send(e);
    });

});

//additional feature for retreving tasks separately

app.get('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOne({
        _id: req.params.taskId,
        _listId: req.params.listId
    }).then((task) => {
        res.send(task);
    });
})

/*post lists*/

app.post("/lists", authenticate, (req, res) => {
    //return new lists
    let title = req.body.title;

    let newList = new List({
        title,
        _userId:req.user_id
    });
    newList.save().then((listDoc) => {
        //the full list document returned
        res.send(listDoc);
    });
});

/* Update the lists*/

app.patch("/lists/:id", authenticate, (req, res) => {
    //add up new values
    List.findOneAndUpdate({ _id: req.params.id, _userId:req.user_id }, {
        $set: req.body
    }).then(() => {
        res.sendStatus(200);
    });
});

/* delete lists */

app.delete("/lists/:id",authenticate, (req, res) => {
    //deletes the lists
    List.findOneAndRemove({
        _id: req.params.id,
        _userId: req.user_id
    }).then((removedListDoc) => {
        res.send(removedListDoc);
        //delete all task that are in deleted list

        deleteTasksFromList(removedListDoc._id);
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
app.get('/lists/:listId/tasks',authenticate, (req, res) => {
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

app.post("/lists/:listId/tasks", authenticate, (req, res) => {
    const { listId } = req.params;
    const { title } = req.body;

    // Validate listId before using it
    if (!mongoose.Types.ObjectId.isValid(listId)) {
        return res.status(400).json({ error: "Invalid list ID format" });
    }

    // Create a new task with a valid ObjectId

    List.findOne({
        _id:req.params.listId,
        _userId:req.user_id
    }).then((list)=>{
        if(list){
            return true;
        }
        return false;
    }).then((canCreateTask)=>{
        if(canCreateTask){
            
            let newTask = new Task({
                title: title,
                _listId: new mongoose.Types.ObjectId(listId) // Ensure listId is stored as ObjectId
            });
        
            newTask.save()
                .then((newTaskDoc) => res.status(201).json(newTaskDoc))
                .catch((err) => res.status(500).json({ error: err.message }));
        }else{
            res.sendStatus(404);
        }
    })
});




//for the update(patch)
app.patch("/lists/:listId/tasks/:taskId",authenticate, (req, res) => {
    //for updating existing task

    List.findOne({
        _id:req.params.listId,
        userId:req.user_id,
    }).then((list)=>{
        if(list){
            return true;
        }
        return false;
    }).then((canUpdateTasks)=>{
        if(canUpdateTasks){
            //currently auth user can update tasks
            Task.findOneAndUpdate({
                _id: req.params.taskId,
                _listId: req.params.listId
            }, {
                $set: req.body
            }
            ).then(() => {
                res.send({ message: 'updated successfully' });
            })
        }else{
            res.sendStatus(404);
        }
    });
});



//for the delete task
app.delete('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {

    List.findOne({
        _id:req.params.listId,
        userId:req.user_id,
    }).then((list)=>{
        if(list){
            return true;
        }
        return false;
    }).then((canDeleteTasks)=>{
        if(canDeleteTasks){

            Task.findOneAndRemove({
                _id: req.params.taskId,
                _listId: req.params.listId
            }).then((removedTaskDoc) => {
                res.send(removedTaskDoc);
            });
        }else{
            res.sendStatus(404);
        }
    });
});


/* User Routes 
purpose : Signup
*/

app.post('/users', (req, res) => {
    //signup
    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        return newUser.generateAccessAuthToken().then((accessToken) => {
            return { accessToken, refreshToken }
        })
    }).then((authTokens) => {
        //construct and send res to user
        res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    })
})


//user route
//for the signin method

app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            //session created successfully
            return user.generateAccessAuthToken().then((accessToken) => {
                return { accessToken, refreshToken }
            });
        }).then((authTokens) => {
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
})


//get users access token 
app.get('/users/me/access-token', verifySession,(req,res)=>{
    req.userObject.generateAccessAuthToken().then((accessToken)=>{
        res.header('x-access-token', accessToken).send({accessToken});
    }).catch((e)=>{
        res.status(400).send(e);
    })
});


/*HELPER METHODS */
let deleteTasksFromList = (_listId)=>{
    Task.deleteMany({
        _listId
    }).then(()=>{
        console.log("Task from "+ _listId + "deleted");
    })
}


app.listen(3000, () => {
    console.log("server started at port 3000");
})