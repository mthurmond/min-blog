const express = require('express'); 
const router = express.Router(); 

// to use data from flatfile
// const data = require('../data/postData.json').data; 
// const posts = data.posts; 

// hook up db
const { Sequelize } = require('../db'); // automatically pulls in index.js file
const db = require('../db'); 
const { Post } = db.models;

db.sequelize.sync({ alter: true }); // creates db and table(s)

// view all posts
router.get('/', async (req, res) => {
    const posts = await Post.findAll({ order: [[ 'createdAt', 'DESC' ]] }); 
    res.render('index', { posts }); 
}); 

// create new post form
router.get('/new', (req, res) => {
    res.render('form', { }); 
}); 

// create new post in the database
router.post('/', async (req, res) => {
    const post = await Post.create(req.body); 
    res.redirect(`/${post.id}`);   
});

// edit post form
router.get('/edit/:id', async (req, res) => {
    const id = req.params.id; 
    const post = await Post.findByPk(id); 
    res.render('edit', { post }); 
}); 

// edit post in the database
router.post('/edit/:id', async (req, res) => {
    const post = await Post.findByPk(req.params.id);
    await post.update(req.body); 
    res.redirect(`/${post.id}`);   
});

// delete post form
router.get('/destroy/:id', async (req, res) => {
    const id = req.params.id; 
    const post = await Post.findByPk(id); 
    res.render('destroy', { post }); 
}); 

// destroy post in the database
router.post('/destroy/:id', async (req, res) => {
    const post = await Post.findByPk(req.params.id);
    await post.destroy(); 
    res.redirect('/');   
});

// view individual post
router.get('/:id', async (req, res) => {
    const post = await Post.findByPk(req.params.id); 
    const shortDate = post.getShortDate(); 
    res.render('post', { post, shortDate } ); 
}); 

module.exports = router;