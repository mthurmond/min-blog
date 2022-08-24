const Sequelize = require('sequelize');

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

db.models.User.hasMany(db.models.Post);
db.models.Post.belongsTo(db.models.User);

module.exports = db;