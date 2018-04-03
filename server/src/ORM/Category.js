"use strict";
// @flow

// const Op = Sequelize.Op;

module.exports = (sequelize, DataTypes) => {

    const Category = sequelize.define('Category',{
        name: {
            type: DataTypes.STRING,
            primaryKey: true
        }
    });

    return Category;
};