const Sequelize = require('sequelize'); 

module.exports = (sequelize) => {
    class Post extends Sequelize.Model {}
    Post.init({
        title: {
            type: Sequelize.STRING, 
            allowNull: false, 
            validate: { 
                notNull: {
                    msg: 'please provide a "title" value', 
                },
                notEmpty: {
                    msg: 'please provide a "title" value', 
                },   
            },
        }, 
        body: {
            type: Sequelize.TEXT, 
            allowNull: false, 
            validate: {
                notNull: {
                    msg: 'please provide a "Body" value', 
                },
                notEmpty: {
                    msg: 'please provide a "Body" value', 
                },   
             }, 
        }, 
    }, {  
        sequelize 
    }); 

    return Post; 
};