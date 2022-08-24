const express = require('express'); 
const router = express.Router(); 
const rateLimit = require('express-rate-limit');

// import db constants
const { Sequelize } = require('../db'); 
const db = require('../db'); 
const { Op } = Sequelize;  // load operations module
const { Post } = db.models;
const { User } = db.models;

// use express-rate-limit package to limit registration and login requests 
const rateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const loginCheck = function (req, res, next) {
    if (req.session && req.session.userId) {
        return next()
    } else {
        let err = new Error('You must be logged in to perform this action.');
        err.status = 401;
        return next(err);
    }
};

// GET /
router.get('/', (req, res) => {
    // if user is logged in, take them to their posts. if not, go to home screen.
    if (req.session && req.session.userId) {
        res.redirect('/posts')
    } else {
        res.render('home', { title: "Min blog", page: "home" })
    }
});

const postsPerPage = 10;

// GET /posts
router.get('/posts', loginCheck, async (req, res) => {
    const userId = req.session.userId
    const postCount = await Post.count({
        where: {
            UserId: userId
        } 
    }); 
    // determine if pagination needed
    const nextPage = (postCount > postsPerPage) ? 2 : null; 
    const posts = await Post.findAll({
        where: { 
            UserId: userId
        },
        order: [[ 'createdAt', 'DESC' ]],
        limit: postsPerPage
    }); 
    res.render('index', { posts, nextPage }); 
}); 

// GET /home
router.get('/home', (req, res) => {
    res.render('home', { title: "Min blog", page: "home" }); 
});

// GET /test
router.get('/test', (req, res) => {
    res.render('test', { title: "test", page: "test" }); 
}); 

// GET /page/:page-number
router.get('/page/:page', loginCheck, async (req, res, next) => {
    try {
        // select posts to show on page 
        const page = parseInt(req.params.page); 
        const queryOffset = (page - 1) * postsPerPage;
        const userId = req.session.userId
        const posts = await Post.findAll({
                where: {
                    UserId: userId
                },
                order: [[ 'createdAt', 'DESC' ]], 
                limit: postsPerPage, offset: queryOffset
            }); 
        // if no posts exist for page entered, throw error
        if (posts <= 0) {
            throw new Error(); 
        }
        // add "show more posts" button if applicable
        const maxViewedPosts = page * postsPerPage; 
        const postCount = await Post.count({
            where: {
                UserId: userId
            }
        });
        const nextPage = (postCount > maxViewedPosts) ? page + 1 : null;
        res.render('index', { posts, nextPage }); 
    } 
    catch (err) {
        err = new Error('This page could not be found.'); 
        err.status = 404; 
        next(err); 
    }
}); 

// GET /register
router.get('/register', (req, res) => {
    res.render('login', { title: "Register", formAction: '/register', buttonLabel: 'Register', page: 'register' }); 
}); 

// POST /register
router.post('/register', rateLimiter, async (req, res, next) => {

    // ensure email is unique
    const emailEntered = req.body.email;
    const emails = await User.findAll({ 
        attributes: ['email'],
        order: [[ 'email', 'ASC' ]] 
    });
    let emailExists;
    for (let email of emails) {
        if (emailEntered === email.dataValues.email) {
            emailExists = true; 
            break
        }
    }
    if (emailExists) {
        const err = new Error('Email is already registered');
        err.status = 401; 
        next(err);
    } else {
        // if email doesn't already exist, create the user
        const user = await User.create(req.body); 
        req.session.userId = user.id;
        res.redirect('/'); 
    }
}); 

// GET /login
router.get('/login', (req, res) => {
    res.render('login', { title: "Login", formAction: '/login', buttonLabel: 'Login', page: 'login' }); 
}); 

// POST /login
router.post('/login', rateLimiter, async (req, res, next) => { 
    const user = await User.findOne({where: {email: req.body.email}}); 
    // ensure passwords match
    const passwordMatch = await user.checkPasswordMatch(req.body.password, user.password);
    if (passwordMatch) {
        req.session.userId = user.id;
        res.redirect('/');
    } else {
        let err = new Error('Passwords do not match');
        err.status = 401;
        next(err);
    }
}); 

// GET /logout
router.get('/logout', function(req, res, next) {
    req.session.destroy();
    return res.redirect('/'); 
});  

// GET /new
router.get('/new', loginCheck, (req, res) => {
    res.render('new', { title: "New post", page: "new", action: '/new' }); 
}); 

// POST /new
router.post('/new', loginCheck, async (req, res, next) => {
    try {
        const post = await Post.create({
            title: req.body.title, 
            body: req.body.body,
            status: req.body.status,
            UserId: req.session.userId 
        });
        res.redirect(`/${post.slug}`);  
    } 
    catch (err) {
        err.message = err.errors[0].message;
        err.status = 400; 
        next(err); 
    }
});

// GET /edit 
router.get('/edit/:slug', loginCheck, async (req, res, next) => {
    try {
        const post = await Post.findOne({where: {slug: req.params.slug}});
        const formAction = '/edit' + `/${post.slug}`
        res.render('edit', { post, title: `Edit post | ${post.title}`, page: 'edit', action: formAction });
    } 
    catch (err) {
        err.message = 'This post could not be found.'
        err.status = 404; 
        next(err); 
    }
}); 

// POST /edit 
router.post('/edit/:slug', loginCheck, async (req, res, next) => {
    try {
        const post = await Post.findOne({where: {slug: req.params.slug}}); 
        await post.update(req.body); 
        res.redirect(`/${post.slug}`);         
    } 
    catch (err) {
        err.message = err.errors[0].message;
        err.status = 400; 
        next(err); 
    }
});

// POST /destroy
router.post('/destroy/:slug', loginCheck, async (req, res) => {
    const post = await Post.findOne({where: {slug: req.params.slug}}); 
    await post.destroy(); 
    res.redirect('/');   
});

// GET /:slug
router.get('/:slug', loginCheck, async (req, res, next) => {
    try {
        const post = await Post.findOne({where: {slug: req.params.slug}});
        // throw error if unauthenticated user attempting to view draft post
        if(post.status == 'draft' && !req.session.userId) {
            let err = new Error('You must be logged in to perform this action.');
            err.status = 401;
            return next(err);
        }
        res.render('post', { post, title: post.title } );
    } 
    catch(err) {
        err = new Error("This page could not be found.");
        err.status = 404;
        next(err); 
    }
}); 

module.exports = router;