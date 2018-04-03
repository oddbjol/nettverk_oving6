"use strict";
// @flow
let sequelize = require("./sequelize");
let Article = sequelize.import('./Article');
let Category = sequelize.import('./Category');
let Comment = sequelize.import('./Comment');

async function main(){

    await sequelize.sync({force: true});

    await Article.create({
        title: 'Article 1',
        text: 'Article 1',
        abstract: 'Article 1',
        category: 'science'
    });
    await Article.create({
        title: 'Article 2',
        text: 'Article 2',
        abstract: 'Article 2',
        category: 'science'
    });

    await Article.create({
        title: 'Article 3',
        text: 'Article 3',
        abstract: 'Article 3',
        category: 'politics'
    });

    await Category.create({name: 'science'});

    await Category.create({name: 'politics'});

    await Comment.create({text: 'test 1!!', ArticleId: 1});
    await Comment.create({text: 'test 2!!', ArticleId: 2});
    await Comment.create({text: 'test 3!!', ArticleId: 3});

    sequelize.close();

}

main();

