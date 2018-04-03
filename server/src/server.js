"use strict";
// @flow
import express from 'express';
import bodyParser from 'body-parser';

let sequelize = require("./ORM/sequelize");
let Article = sequelize.import('./ORM/Article');
let Comment = sequelize.import('./ORM/Comment');
let Category = sequelize.import('./ORM/Category');

let server = express();

// Serve the React client
server.use(express.static(__dirname + '/../../client'));

// Automatically parse json content
server.use(bodyParser.json());

// Get all articles
server.get('/articles', (request: express$Request, response: express$Response) => {
  Article.findAll({include: [Comment]}).then(articles => response.send(articles));
});

// Get an article given its id
server.get('/articles/:id', (request: express$Request, response: express$Response) => {
  Article.findById(request.params.id, {include: [Comment]}).then(article => {
    if(article)
      response.send(article);
    else
      response.sendStatus(404);
  });
});

// Get articles by category
server.get('/articlesByCategory/:category', (request: express$Request, response: express$Response) => {
    Article.findAll({
        where: {category: request.params.category},
    include: [Comment]}).then(articles => {
        if(articles)
            response.send(articles);
        else
            response.sendStatus(404);
    });
});

// Add new article
server.post('/articles', (request: express$Request, response: express$Response) => {

  if (request.body && typeof request.body.title == 'string' && typeof request.body.abstract == 'string' && typeof request.body.text == 'string' && typeof request.body.category == 'string') {
    let article = Article.build({
        title: request.body.title,
        abstract: request.body.abstract,
        text: request.body.text,
        category: request.body.category
    });

    article.save().then(() => {
        response.send(article.id.toString());
    }).catch(err => {
        response.sendStatus(500);
      });
  }
  else  // Respond with bad request status code
    response.sendStatus(400);
});

// Comment on an article
server.post('/articles/:id/comment/:comment', (request: express$Request, response: express$Response) => {
   let comment = Comment.build({ArticleId: request.params.id, text: request.params.comment});

   comment.save().then(() => {
       response.send();
   }).catch(err => {
       response.sendStatus(500);
   });
});

server.post('/articles/:id/upvote', (request: express$Request, response: express$Response) => {
    Article.findById(request.params.id).then(article => {
        article.upvote();
        return article.save();
    }).then(() => {
        response.sendStatus(200);
    }).catch(err => {
        response.sendStatus(500);
    });
});

server.post('/articles/:id/downvote', (request: express$Request, response: express$Response) => {
    Article.findById(request.params.id).then(article => {
        article.downvote();
        return article.save();
    }).then(() => {
        response.sendStatus(200);
    }).catch(err => {
        response.sendStatus(500);
    });
});

server.get('/categories', (request: express$Request, response: express$Response) => {
    Category.findAll().then(categories => {
        response.send(categories);
    }).catch(err => {
        response.sendStatus(500);
    });
});

// Start the web server at port 3000
server.listen(3000);
