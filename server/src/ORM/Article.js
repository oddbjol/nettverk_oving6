"use strict";
// @flow

// const Op = Sequelize.Op;

let sequelize = require('./sequelize');
let Comment = sequelize.import('./Comment');

module.exports = (sequelize, DataTypes) => {

    const Article = sequelize.define('Article',{
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: DataTypes.STRING,
        abstract: DataTypes.STRING,
        text: DataTypes.STRING,
        category: DataTypes.STRING,
        score: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    });

    Article.prototype.upvote = function(){
        this.score++;
    };

    Article.prototype.downvote = function(){
        this.score--;
    };

    Article.hasMany(Comment);

    return Article;
};