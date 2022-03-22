const Sequelize = require('sequelize');

// connect to sqlite
// const sequelize = new Sequelize({
//     dialect: 'sqlite',
//     storage: 'posts.db'
// });

// connect to pg on local
// const sequelize = new Sequelize(process.env.DATABASE_URL, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
//     host: process.env.DB_HOST,
//     dialect: 'postgres'
//   });

sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

const db = {
    sequelize, 
    Sequelize, 
    models: {}, 
}; 

db.models.Post = require('./models/post.js')(sequelize); 
db.models.User = require('./models/user.js')(sequelize); 

module.exports = db;