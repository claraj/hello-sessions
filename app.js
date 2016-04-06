var express = require('express');   //Need express...
var logger = require('morgan');   //Enable logging
var session = require('express-session')  //To handle sessions
var parseurl = require('parseurl') //get the actual url requested, will use to count visits to particular pages.

var MongoDBStore = require('connect-mongodb-session')(session);

app = express();         //Create app
app.use(logger('dev'));   //Initialize logger - do this first

var store = new MongoDBStore(
  {
    uri:'mongodb://localhost:27017/session_db',
    collection:'mySessions'
  }
)

store.on('error', function(error){
  asset.ifError(error);
  assert.ok(false);     //crash app if can't connect.
});

app.use(session({
  secret: "random_number_here",  //replace in production app!
  store: store                   //Indicate where to store cookies
}));



//All routes will run this function first
//Calling next() at the end of this function will run the next matching route handler
app.use(function(req, res, next){
  console.log(req.session.id);
  var views = req.session.views

  if (!views) {
    views = req.session.views = {}; //first time visitor - set up view counter
  }

  var path = parseurl(req).pathname   //get the URL used in this request

  if (!req.session.views[path]) {    //If no record for this URL yet...
    req.session.views[path] = 1;
  } else {                           //User has already visited this page, add 1 to page count
    req.session.views[path]++ ;
  }

  next();    //And call the next matching route handler
});


//Home page will display the last animal page the user visited.
app.get('/', function(req, res, next){
  var lastpage = req.session.lastpage;
  if (lastpage){
    res.send("The last animal page you visited was " + lastpage)
  } else {
    res.send("You have not visited any animal pages.")
  }
})

//This is an animal page, so add it to the session
//as the last animal page visited.
app.get('/cat', function(req, res){
  req.session.lastpage = "cat";
  res.send('Cat page')
});

//Same for fish. Can you see a way to avoid
//adding all of the animal pages manually?
app.get('/fish', function(req, res) {
  req.session.lastpage = "fish";
  res.send('Fish page');
});



app.get('/counts', function(req, res){
  res.send("You have visited these pages, " + JSON.stringify(req.session.views))
});

app.listen(3040);  //And listen on port 3040.
