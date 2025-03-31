const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');


//jwt secret
const jwtSecret = "569283698212938bdhytsdcggkndolaz19825083647";


//user model structure

const UserSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        minlength:1,
        trim:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:8,
    },
    sessions:[{
        token:{
            type:String,
            required:true,
        },
        expiresAt:{
            type:Number,
            required:true
        }
    }]
});

//creating instance methods

//instance method 1

UserSchema.methods.toJson = function(){
    const user = this;
    const userObject = user.toObject();

    //must be kept private
    return _.omit(userObject, ['password', 'sessions']);
}

//instance method 2

UserSchema.methods.generateAccessAuthToken = function(){
    const user = this;
    return new Promise((resolve, reject)=>{
        //creation of Json web token
        jwt.sign({_id:user._id.toHexString() }, jwtSecret, {expiresIn: "15m"}, (err, token)=>{
            if(!err){
                resolve(token);
            }else{
                //if there is error
                reject();
            }
        })
    })
}

//instance method 3
//this method generates 64bit hex string
UserSchema.methods.generateRefreshAuthToken = function(){
    return new Promise((resolve, reject)=>{
        crypto.randomBytes(64, (err,buf)=>{
            if(!err){
                //no error
                let token = buf.toString("hex");
                return resolve(token);
            }
        })
    })
}


//instance method 4
//create session
UserSchema.methods.createSession = function(){
    let user = this;

    return user.generateRefreshAuthToken().then((refreshToken)=>{
        return saveSessionToDatabase(user, refreshToken);
    }).then((refreshToken)=>{
        return user.save().then(()=>{
            //return refresh token
            return refreshToken;
        }).catch((e)=>{
            return Promise.reject('Failed to save in db \n'+e);
        })
    })
}


//modal methods (static):

UserSchema.statics.getJWTSecret = ()=>{
    return jwtSecret;
}

UserSchema.statics.findByIdAndToken = function(_id, token){
    //find user by id and token
    const User = this;
    return User.findOne({
        _id,
        'sessions.token':token
    });
}


UserSchema.statics.findByCredentials = function(email, password){
    let User = this
    return User.findOne({email}).then((user)=>{
        if(!user) return Promise.reject();

        return new Promise((resolve, reject)=>{
            bcrypt.compare(password, user.password, (err,res)=>{
                if(res) resolve(user);
                else{
                    reject();
                }
            })
        })
    })
}

UserSchema.statics.hasRefreshTokenExpired = (expiresAt)=>{
    let secondsSinceEpoch = Date.now() / 1000;
    if(expiresAt > secondsSinceEpoch){
        return false;
    }else{
        return true;
    }
}

//middleware


UserSchema.pre('save', function(next){
    let user = this;
    let costFactor = 10;

    if(user.isModified('password')){
        //if password changed then run this code

        //generate salt
        bcrypt.genSalt(costFactor, (err,salt)=>{
            bcrypt.hash(user.password, salt, (err,hash)=>{
                if (err) return next(err);
                user.password = hash;
                next();
            })
        })
    }else{
        next();
    }
})




//instance method 5
let saveSessionToDatabase = (user, refreshToken)=>{
    //save session to db
    return new Promise((resolve,reject)=>{
        let expiresAt = generateRefreshTokenExpiryTime();

        user.sessions.push({'token':refreshToken, expiresAt});

        user.save().then(()=>{
            return resolve(refreshToken);
        }).catch((e)=>{
            reject(e);
        });
    })
}


let generateRefreshTokenExpiryTime = ()=>{
    let daysUntilExpiry = 10;
    let secondUntilExpiry = ((daysUntilExpiry*24) *60) *60;
    return ((Date.now()/ 1000)+ secondUntilExpiry);
}


const User = mongoose.model('User', UserSchema);

module.exports = { User};