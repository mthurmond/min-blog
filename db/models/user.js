const Sequelize = require('sequelize'); 
const bcrypt = require('bcrypt'); 

module.exports = (sequelize) => {
    class User extends Sequelize.Model {}
    User.init({
        email: {
            type: Sequelize.TEXT, 
            allowNull: false, 
            validate: { 
                notNull: {
                    msg: 'please provide an email', 
                },
                notEmpty: {
                    msg: 'please provide an email', 
                },   
            },
        }, 
        password: {
            type: Sequelize.TEXT, 
            allowNull: false, 
            validate: {
                notNull: {
                    msg: 'please provide a password', 
                },
                notEmpty: {
                    msg: 'please provide a password', 
                },   
             }, 
        }, 
    }, {
        hooks: {
          beforeCreate: async (user) => {
            const salt = await bcrypt.genSaltSync(10);
            user.password = bcrypt.hashSync(user.password, salt);
          }
        },   
        sequelize 
    }); 

    return User; 
};