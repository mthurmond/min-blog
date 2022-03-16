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
db.models.User = require('./models/user.js')(sequelize); 

module.exports = db;