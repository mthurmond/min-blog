const Sequelize = require('sequelize'); 

module.exports = (sequelize) => {
    class User extends Sequelize.Model {
    }
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
        sequelize 
    }); 

    return User; 
};