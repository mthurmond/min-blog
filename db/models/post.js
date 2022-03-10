const Sequelize = require('sequelize'); 
const moment = require('moment'); 

module.exports = (sequelize) => {
    class Post extends Sequelize.Model {
        getShortDate() {
            const shortDate = moment(this.createdAt).format('MMMM D, YYYY');
            return shortDate; 
        }
        getShortBody() {
            let bodyHtml= this.body;
            let bodyText = bodyHtml.replace(/<[^>]+>/g, ''); // remove html tags
            bodyText = bodyText.replace(/&nbsp;/g, ' '); // remove non-breaking space html entities
            const shortBody = bodyText.length > 200 ? `${bodyText.slice(0,200)}...` : bodyText; 
            return shortBody; 
        }
    }
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