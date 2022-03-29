const Sequelize = require('sequelize');

console.log(process.env.NODE_ENV); 

if (process.env.NODE_ENV === 'development') {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      logging: false
    });
} else {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        }
      }
    );
}

const db = {
    sequelize, 
    Sequelize, 
    models: {}, 
}; 

db.models.Post = require('./models/post.js')(sequelize); 
db.models.User = require('./models/user.js')(sequelize); 

module.exports = db;