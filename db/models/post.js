const Sequelize = require('sequelize'); 
const moment = require('moment'); 
const slug = require('slug');
const { nanoid } = require('nanoid');

module.exports = (sequelize) => {
    class Post extends Sequelize.Model {
        getShortDate() {
            const shortDate = moment(this.createdAt).format('MMMM D, YYYY');
            return shortDate; 
        }
        getShortBody() {
            let bodyHtml = this.body;
            // convert closing tags (div, list item, double page breaks) and non-breaking space html entities to spaces
            let bodyWithSpaces = bodyHtml.replace(/<\/div>|<\/li>|<br><br>|&nbsp;/g, ' ');
            // remove image caption and pre-formatted (i.e. code) elements
            let bodyNoCaptions = bodyWithSpaces.replace(/<(figcaption|pre)[^<]*<\/(figcaption|pre)>/g, '');
            // remove all other html tags, but not the text between them
            let bodyText = bodyNoCaptions.replace(/<[^>]+>/g, '');
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
        status: {
            type: Sequelize.STRING, 
            allowNull: true, 
        }, 
    }, {
        hooks: {
          beforeCreate: async (post) => {
            const newSlug = await slug(post.title);
            const randomID = await nanoid(4);
            post.slug = `${newSlug}-${randomID}`;
          }, 
          beforeUpdate: async (post) => {
            const newSlug = await slug(post.title);
            const randomID = await nanoid(4);
            post.slug = `${newSlug}-${randomID}`;
          } 
        }, 
        sequelize 
    }); 

    return Post; 
};