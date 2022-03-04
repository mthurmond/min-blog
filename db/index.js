const Sequelize = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'posts.db'
});

const db = {
    sequelize, 
    Sequelize, 
    models: {}, 
}; 

db.models.Post = require('./models/post.js')(sequelize); 

module.exports = db;