var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cheerio = require('cheerio');
var request = require('request');
var Note = require('./models/note.js');
var Article = require('./models/article.js');
var expressHandlebars = require("express-handlebars");


mongoose.Promise = Promise;

var app = express();

app.use(bodyParser.urlencoded({
  extended: false
}));

// //Handlebars

console.log("handlebars");

app.engine('handlebars', expressHandlebars({defaultLayout: 'main'}));
// Now set handlebars engine
app.set('view engine', 'handlebars');

app.use(express.static("public"));

mongoose.connect("mongodb://localhost/mongoscrape");
var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: " + error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// mongoose routes

app.get("/scrape", function(req, res) {
  request("http://www.nytimes.com", function(error, response, html) {
    var $ = cheerio.load(html);
    $('h2.story-heading').each(function(i, element) {
      var result = {};
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      var entry = new Article(result);

      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(doc);
        }
      });
    });
  });
  res.send("Scrape complete");
});

app.get("/articles", function(req, res) {
  Article.find({}, function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});

app.get("/articles/:id", function(req, res) {
  Article.findOne({ "_id": req.params.id })
  .populate("note")
  .exec(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});

app.post("/articles/:id", function(req, res) {
  var newNote = new Note(req.body);
  newNote.save(function(error, doc) {
    if (err) {
      console.log(err);
    }
    else {
      res.send(doc);
    }
  });
});

app.listen(3000, function() {
  console.log("Running on port 3000");
});


// var express = require("express");
// var bodyParser = require("body-parser");
// var logger = require("morgan");
// var mongoose = require("mongoose");
// //new ones for this assignment
// var expressHandlebars = require("express-handlebars");
// var request = require("request");


// // Our scraping tools
// // Axios is a promised-based http library, similar to jQuery's Ajax method
// // It works on the client and on the server
// var axios = require("axios");
// var cheerio = require("cheerio");

// // Require all models
// var db = require("./models");

// var PORT = 3000;

// // Initialize Express
// var app = express();

// //Handlebars

// console.log("handlebars");

// app.engine('handlebars', expressHandlebars({defaultLayout: 'main'}));
// // Now set handlebars engine
// app.set('view engine', 'handlebars');

// // Configure middleware

// console.log("configure middleware");

// // Use morgan logger for logging requests
// app.use(logger("dev"));
// // Use body-parser for handling form submissions
// app.use(bodyParser.urlencoded({ extended: false }));
// // Use express.static to serve the public folder as a static directory
// app.use(express.static("public"));

// // Set mongoose to leverage built in JavaScript ES6 Promises
// // Connect to the Mongo DB

// console.log("mongoose");

// mongoose.Promise = Promise;
// mongoose.connect("mongodb://localhost/scrape-news", {
//   useMongoClient: true
// });

// var dbm = mongoose.connection;


// // show any mongoose errors
// dbm.on("error", function(error) {
//   console.log("Mongoose Error: ", error);
// });

// // once logged into the db through mongoose, log a success message
// dbm.once("open", function() {
//   console.log("Mongoose connection successful.");
// });


// // Routes

// console.log("xxx");
// // A GET route for scraping the echojs website
// app.get("/scrape", function(req, res) {
//   console.log("yyy");
//   console.log("server.js scrape");
//   // First, we grab the body of the html with request
//   // request("http://www.nytimes.com", function(error, response, html) {
//       axios.get("http://www.nytimes.com").then(function(response) {
//         console.log("axios.get");

//   // The origional assignment code: ````````` qaxios.get("http://www.echojs.com/").then(function(response) {
//     // Then, we load that into cheerio and save it to $ for a shorthand selector
//     var $ = cheerio.load(response.data);

//     // Now, we grab every h2 within an article tag, and do the following:
//     $("article h2").each(function(i, element) {
//       // Save an empty result object
//       var result = {};

//       // Add the text and href of every link, and save them as properties of the result object
//       result.title = $(this)
//         .children("a")
//         .text();
//       result.link = $(this)
//         .children("a")
//         .attr("href");

//       result.link = $(this)
//         .children("div.text")
//         .text();

//       // Create a new Article using the `result` object built from scraping
//       db.Article
//         .create(result)
//         .then(function(dbArticle) {
//           // If we were able to successfully scrape and save an Article, send a message to the client
//           res.send("Scrape Complete");
//         })
//         .catch(function(err) {
//           console.log("eee");
//           // If an error occurred, send it to the client
//           res.json(err);
//         });
//     });
//   });
// });

// console.log("zzz");
// // Route for getting all Articles from the db
// app.get("/articles", function(req, res) {
//   console.log("get articles 1");
//   // Grab every document in the Articles collection
//   db.Article
//     .find({})
//     .then(function(dbArticle) {
//       console.log("branch 1");
//       console.log("dbArticle " + dbArticle);
//       // If we were able to successfully find Articles, send them back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       console.log("branch error");
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

// // Route for grabbing a specific Article by id, populate it with it's note
// app.get("/articles/:id", function(req, res) {
//   console.log("get articles 2");
//   // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
//   db.Article
//     .findOne({ _id: req.params.id })
//     // ..and populate all of the notes associated with it
//     .populate("note")
//     .then(function(dbArticle) {
//       // If we were able to successfully find an Article with the given id, send it back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

// // Route for saving/updating an Article's associated Note
// app.post("/articles/:id", function(req, res) {
//   console.log("post articles");
//   // Create a new note and pass the req.body to the entry
//   db.Note
//     .create(req.body)
//     .then(function(dbNote) {
//       // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
//       // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
//       // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
//       return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
//     })
//     .then(function(dbArticle) {
//       // If we were able to successfully update an Article, send it back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

// // Start the server
// app.listen(PORT, function() {
//   console.log("App running on port " + PORT + "!");
// });


// // mongoose.connect(mongodb://heroku_lk19fq7r:3p8k7q0h104opfdr7ddl093cak@ds125195.mlab.com:25195/heroku_lk19fq7r)