//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const aboutContent = "Compose Note is an app designed for note taking, organizing and task management. Compose Note helps you focus on what matters most and have access to your information when you need it. Input typed notes,  keep journals, documenting the news, events and milestones of your daily life.  Use Compose Note as a digital notepad, planner and easy-to-format word processor for all your thoughts and memos as they come. Make personal to do lists to keep your thoughts organized Set reminders to keep on top of activities and write to-do lists.Create notebooks, write notes, memos and journals on the go with the easy-to-use notepad.";
const homeStartingContent = "Compose Note is an app designed for note taking, organizing and task management. Compose Note helps you focus on what matters most and have access to your information when you need it. Input typed notes,  keep journals, documenting the news, events and milestones of your daily life.  Use Compose Note as a digital notepad, planner and easy-to-format word processor for all your thoughts and memos as they come. Make personal to do lists to keep your thoughts organized Set reminders to keep on top of activities and write to-do lists.Create notebooks, write notes, memos and journals on the go with the easy-to-use notepad.";

mongoose.connect('mongodb+srv://admin-Ashish:9606411717@cluster0-jhlkj.mongodb.net/ComposeNoteDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
// mongoose.connect('mongodb://localhost:27017/ComposeNoteDB', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useFindAndModify: false
// });

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(session({
  secret: "its our secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.set("useCreateIndex", true);

const UserSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  mobile: Number,
  email: String,
  password: String,
  title: [],
  post: []
});

UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model("user", UserSchema);
passport.use(User.createStrategy());


// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


app.get("/", function(req, res) {

  if(req.isAuthenticated()){
    User.findById(req.user.id, function(err,founduser){
      if(err){
        console.log(err);
      }
      else
        res.render("home", {
        homecontent: homeStartingContent,
        postcontent: founduser
       });
      });
      }
  else {
        res.redirect("/login");
      }

});

app.get("/about", function(req, res) {
  res.render("about", {
    about: aboutContent
  });
});

app.get("/contact", function(req, res) {
  res.render("contact", {
  });
});

app.get("/compose", function(req, res) {
  res.render("compose");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/Signup", function(req, res) {
  res.render("Signup");
});

app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/");
  });

app.get("/profile", function(req,res){
    User.findById(req.user.id, function(err,founduser){
    res.render("profile", {
      username : founduser.firstname + " " + founduser.lastname,
      email : founduser.username,
      mobile : founduser.mobile,
      postcontent : founduser
    });
  });
});

app.post("/compose", function(req, res) {

  composetext = req.body.titleinput;

  textinput = req.body.posthome;

  User.findByIdAndUpdate(req.user.id,
    {$push: {title:composetext, post:textinput}},
    {safe: true, upsert: true},
    function(err, doc) {
        if(err){
        console.log(err);
        }else{
        res.redirect("/");
        }
    }
 );
});


app.get("/posts/:id", function(req, res) {
  const urlid = req.params.id;

  User.findById(req.user.id, function(err,founditems) {

     if(err){
       console.log(err);
     }

     else {
        for(var i=0; i<founditems.title.length; i++) {

         if (urlid == founditems.title[i]) {
           res.render("post", {
             postitle: founditems.title[i],
             postcontent: founditems.post[i],
           });

         }
     }
    }
  });
});

app.post("/DeleteNote", function(req, res) {

  const j = req.body.button;

  User.findById(req.user.id, function(err,founduser){
    if(err)
    {
      console.log(err);
     }
    else
      {
       User.findByIdAndUpdate(req.user.id,
         {$pull: {title:founduser.title[j], post:founduser.post[j]}},
         {safe: true, upsert: true},
         function(err, doc) {
             if(err){
             console.log(err);
             }
             else{
             res.redirect("/");
             }
        });
      }
  });
});

//Register and login Route
app.post("/Signup", function(req, res) {
  User.register({firstname: req.body.first, lastname: req.body.last, mobile: req.body.mobile, username: req.body.username}, req.body.password, function(err, user){

      if(err){
        console.log(err);
        res.redirect("/Signup");
      }
      else {
        passport.authenticate("local")(req,res,function(){
          res.redirect("/");
        });
      }
    });

});

app.post("/login", function(req,res){

   const user = new User({
     username: req.body.username,
     password: req.body.password
   });

   req.login(user, function(err){
     if(err) {
       console.log(err);
     }
     else {
       passport.authenticate("local")(req,res,function(){
         res.redirect("/");
       });
     }
   });
 });

// let port = process.env.PORT;
// if(port== null || port==""){
//   port = 3000;
// }

app.listen(process.env.PORT || 3000, function() {
  console.log("Server has Started Successfuly");
});
