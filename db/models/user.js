const Sequelize = require('sequelize'); 
const bcrypt = require('bcrypt'); 

module.exports = (sequelize) => {
    class User extends Sequelize.Model {
        async checkPasswordMatch(passwordEntered, passwordInDb) {
            const doPasswordsMatch = await bcrypt.compare(passwordEntered, passwordInDb); 
            return doPasswordsMatch; 
        }
    }
    User.init({
        name: {
            type: Sequelize.TEXT, 
            allowNull: false, 
            validate: { 
                notNull: {
                    msg: 'please provide a name', 
                },
                notEmpty: {
                    msg: 'please provide a name', 
                },   
            },
        }, 
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
        photo: {
            type: Sequelize.TEXT, 
            allowNull: true,
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