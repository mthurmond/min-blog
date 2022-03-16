const express = require('express'); 
const router = express.Router(); 

// to use data from flatfile
// const data = require('../data/postData.json').data; 
// const posts = data.posts; 

// hook up db
const { Sequelize } = require('../db'); // automatically pulls in index.js file
const db = require('../db'); 
const { Post } = db.models;
const { User } = db.models;

db.sequelize.sync({ force: true }); // creates db and table(s)

// GET /register
router.get('/register', (req, res) => {
    res.render('register', { }); 
}); 

// POST /register
router.post('/register', async (req, res) => {
    const user = await User.create(req.body); 
    res.redirect('/'); 
}); 

// GET /login
router.get('/login', (req, res) => {
    res.render('login', { }); 
}); 

// POST /login
router.post('/login', async (req, res) => { 

    // log user in
    // User.authenticate(req.body.email, req.body.password, function(error, user) {
    //     req.session.userId = user._id;
        res.redirect('/'); 
    // });
}); 

// GET /
router.get('/', async (req, res) => {
    const posts = await Post.findAll({ order: [[ 'createdAt', 'DESC' ]] }); 
    res.render('index', { posts }); 
}); 

// GET /new
router.get('/new', (req, res) => {
    res.render('form', { }); 
}); 

// POST / {creates new post in the database -- CHANGE this route later to '/new'} 
router.post('/', async (req, res) => {
    const post = await Post.create(req.body); 
    res.redirect(`/${post.id}`);   
});

// GET /edit 
router.get('/edit/:id', async (req, res) => {
    const id = req.params.id; 
    const post = await Post.findByPk(id); 
    res.render('edit', { post }); 
}); 

// POST /edit 
router.post('/edit/:id', async (req, res) => {
    const post = await Post.findByPk(req.params.id);
    await post.update(req.body); 
    res.redirect(`/${post.id}`);   
});

// GET /destroy
router.get('/destroy/:id', async (req, res) => {
    const id = req.params.id; 
    const post = await Post.findByPk(id); 
    res.render('destroy', { post }); 
}); 

// POST /destroy
router.post('/destroy/:id', async (req, res) => {
    const post = await Post.findByPk(req.params.id);
    await post.destroy(); 
    res.redirect('/');   
});

// GET /:id
router.get('/:id', async (req, res) => {
    const post = await Post.findByPk(req.params.id); 
    res.render('post', { post } ); 
}); 

module.exports = router;