const Sequelize = require('sequelize'); 
const moment = require('moment'); 
const slug = require('slug');

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
            const shortBody = bodyText.length > 340 ? `${bodyText.slice(0,340)}...` : bodyText; 
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
        slug: {
            type: Sequelize.STRING, 
            allowNull: true, 
        }, 
    }, {
        hooks: {
          beforeCreate: async (post) => {
            const newSlug = await slug(post.title);
            post.slug = newSlug;
          } 
        }, 
        sequelize 
    }); 

    return Post; 
};