const Sequelize = require('sequelize');

// connect to sqlite
// const sequelize = new Sequelize({
//     dialect: 'sqlite',
//     storage: 'posts.db'
// });

// connect to pg
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres'
  });

const db = {
    sequelize, 
    Sequelize, 
    models: {}, 
}; 

db.models.Post = require('./models/post.js')(sequelize); 
db.models.User = require('./models/user.js')(sequelize); 

module.exports = db;