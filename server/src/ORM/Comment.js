"use strict";
// @flow

module.exports = (sequelize, DataTypes) => {

    const Comment = sequelize.define('Comment',{
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        text: DataTypes.STRING
    });

    return Comment;
};