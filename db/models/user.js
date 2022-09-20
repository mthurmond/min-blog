const Sequelize = require('sequelize'); 
const bcrypt = require('bcrypt'); 

module.exports = (sequelize) => {
    class User extends Sequelize.Model {
        async checkPasswordMatch(passwordEntered, passwordInDb) {
            const doPasswordsMatch = await bcrypt.compare(passwordEntered, passwordInDb); 
            return doPasswordsMatch; 
        }
        async hashPassword(unhashedPassword) {
            const salt = await bcrypt.genSaltSync(10);
            return bcrypt.hashSync(unhashedPassword, salt);
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
        username: {
            type: Sequelize.TEXT, 
            allowNull: true,
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
                // store encrypted password
                const salt = await bcrypt.genSaltSync(10);
                user.password = bcrypt.hashSync(user.password, salt);

                // generate username from email
                const email = user.email
                const emailPrefix = email.match(/^([^@]*)@/)
                const cleanEmailPrefix = emailPrefix ? emailPrefix[1] : null
                const username = cleanEmailPrefix.replace(/[^a-zA-Z0-9]/g, "")
                user.username = username
            },
        },   
        sequelize 
    }); 

    return User; 
};