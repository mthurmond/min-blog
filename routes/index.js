const express = require('express');

const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg')
    }
})
const upload = multer({ storage: storage })

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

// require app.js in order to use the 'app' variable (exported as 'myApp')
var app = require('../app');
// store user's name and avatar URL in the locals object so they can be used in header
app.myApp.use(async (req, res, next) => {
    if (res.locals.userId) {
        const user = await User.findOne({ where: { id: res.locals.userId } });
        res.locals.name = user.name
        res.locals.email = user.email
        res.locals.username = user.username
        let formattedName = res.locals.name.replace(' ', '+')
        res.locals.defaultAvatar = `https://ui-avatars.com/api/?name=${formattedName}`
        if (user.photo) {
            res.locals.photo = '/static/uploads/' + user.photo
        }
    }
    next();
});

// GET /
router.get('/', (req, res) => {
    // if user is logged in, take them to their posts. if not, go to home screen.
    if (req.session && req.session.userId) {
        res.redirect(`/${res.locals.username}`)
    } else {
        res.render('home', { title: "Min blog", page: "home" })
    }
});

// GET /home
router.get('/home', (req, res) => {
    res.render('home', { title: "Min blog", page: "home" });
});

// GET /test
router.get('/test', (req, res) => {
    res.render('test', { title: "test", page: "test" });
});

// GET /error
router.get('/error/:message/:status', (req, res, next) => {
    let err = new Error(req.params.message);
    err.status = parseInt(req.params.status)
    next(err)
});

// GET /register
router.get('/register', (req, res) => {
    res.render('login', { title: "Create blog", formAction: '/register', buttonLabel: 'Create blog', page: 'register' });
});

// returns undefined if email entered is already in database
async function doesEmailExist(emailEntered) {
    const emails = await User.findAll({
        attributes: ['email'],
        order: [['email', 'ASC']]
    });
    let emailExistsBoolean
    for (let email of emails) {
        if (emailEntered === email.dataValues.email) {
            emailExistsBoolean = true
            break
        }
    }
    return emailExistsBoolean
}

// POST /register
router.post('/register', rateLimiter, async (req, res, next) => {
    try {
        let emailExists = await doesEmailExist(req.body.email)
        if (emailExists === true) {
            const err = new Error('The email you entered is already registered.');
            err.status = 401;
            next(err);
        } else {
            // create the user
            const user = await User.create(req.body);
            req.session.userId = user.id;
            res.redirect('/');
        }
    }
    catch (err) {
        next(err)
    }
});

// GET /settings
router.get('/settings', loginCheck, (req, res) => {
    res.render('settings', { title: "Settings", page: 'settings', headerUrl: '/' });
});

// POST /settings
router.post('/settings', loginCheck, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: res.locals.userId } })
        const field = Object.keys(req.body)[0]
        const value = Object.values(req.body)[0]
        // cleanup if/then logic later
        if (field == 'password') {
            // hash pw before saving
            const hashedPassword = await user.hashPassword(value)
            user[field] = hashedPassword
        } else if (field == 'email') {
            // ensure email is unique before saving
            const emailExists = await doesEmailExist(req.body.email)
            if (emailExists === true) {
                res.status(401)
                res.send('The email you entered is taken.')
            } else {
                user[field] = value
            }
        } else {
            user[field] = value
        }
        // save updated user profile to the db
        await user.save()
        res.end()
    }
    catch (err) {
        err.message = err.errors[0].message;
        err.status = 400;
        next(err);
    }
})

// POST /uploads
router.post('/uploads', loginCheck, upload.single('profile-photo'), async (req, res, next) => {
    // req.file is the name of the file passed from the form
    // req.body holds any text fields. In this case there aren't any so body is null. 
    const file = req.file
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next(error)
    }
    // save photo file name to db
    const user = await User.findOne({ where: { id: res.locals.userId } });
    await user.update({ photo: req.file.filename });
    res.end()
});

// GET /login
router.get('/login', (req, res) => {
    res.render('login', { title: "Login", formAction: '/login', buttonLabel: 'Login', page: 'login' });
});

// POST /login
router.post('/login', rateLimiter, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { email: req.body.email } });
        // ensure passwords match
        if (user) {
            const passwordMatch = await user.checkPasswordMatch(req.body.password, user.password);
            if (passwordMatch) {
                req.session.userId = user.id;
                res.redirect('/');
            } else {
                let err = new Error('Incorrect password');
                err.status = 401;
                next(err);
            }
        } else {
            let err = new Error('User not found');
            err.status = 401;
            next(err);
        }
    }
    catch (err) {
        next(err);
    }
});

// GET /logout
router.get('/logout', function (req, res, next) {
    req.session.destroy();
    return res.redirect('/home');
});

// GET /new
router.get('/new', loginCheck, (req, res) => {
    res.render('new', { title: "New post", page: "new", action: '/new', username: res.locals.username });
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
        res.redirect(`/${res.locals.username}/${post.slug}`);
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
        const post = await Post.findOne({ where: { slug: req.params.slug } });
        const formAction = '/edit' + `/${post.slug}`
        res.render('edit', { post, title: `Edit post | ${post.title}`, page: 'edit', action: formAction, username: res.locals.username });
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
        const post = await Post.findOne({ where: { slug: req.params.slug } });
        await post.update(req.body);
        res.redirect(`/${res.locals.username}/${post.slug}`);
    }
    catch (err) {
        err.message = err.errors[0].message;
        err.status = 400;
        next(err);
    }
});

// POST /destroy
router.post('/destroy/:slug', loginCheck, async (req, res) => {
    const post = await Post.findOne({ where: { slug: req.params.slug } });
    await post.destroy();
    res.redirect('/');
});

// GET /:username/:slug
router.get('/:username/:slug', async (req, res, next) => {
    try {
        const post = await Post.findOne({ where: { slug: req.params.slug } });
        const author = await User.findOne({ where: { id: post.UserId } });
        // check if user is the author and logged in
        const userIsLoggedInAuthor = (author.id === res.locals.userId) ? true : false 
        
        // throw error if someone other than the logged in author is attempting to view a draft post
        if (post.status == 'draft' && !userIsLoggedInAuthor) {
            let err = new Error('The author hasn\'t published this draft post.');
            err.status = 401;
            return next(err);
        }
        
        // if author's photo exists, show it, otherwise show their default avatar
        const formattedName = author.name.replace(' ', '+')
        const defaultAvatar = `https://ui-avatars.com/api/?name=${formattedName}`
        const userPhoto = author.photo ? `/static/uploads/${author.photo}` : defaultAvatar
        
        res.render('post', { post, title: post.title, headerUrl: `/${author.username}`, photo: userPhoto, name: author.name, userId: userIsLoggedInAuthor });
    }
    catch (err) {
        err = new Error("This page could not be found.");
        err.status = 404;
        next(err);
    }
});

const postsPerPage = 10;

// GET /:username
router.get('/:username', async (req, res, next) => {
    try {
        const author = await User.findOne({ where: { username: req.params.username } })
        const userIsLoggedInAuthor = (author.id === res.locals.userId) ? true : false 
        
        // Only show draft posts if user is logged in and is the author
        const allowedStatuses = userIsLoggedInAuthor ? ['live', 'draft'] : ['live']
        // determine if pagination needed
        const postCount = await Post.count({
            where: {
                UserId: author.id,
                status: allowedStatuses
            }
        })
        const nextPage = (postCount > postsPerPage) ? `/${author.username}/2` : null
        const posts = await Post.findAll({
            where: {
                UserId: author.id,
                status: allowedStatuses
            },
            order: [['createdAt', 'DESC']],
            limit: postsPerPage
        })

        // get author photo
        let formattedName = author.name.replace(' ', '+')
        let defaultAvatar = `https://ui-avatars.com/api/?name=${formattedName}`
        const authorPhoto = author.photo ? `/static/uploads/${author.photo}` : defaultAvatar

        res.render('index', { posts, nextPage, page: "posts", title: author.name, name: author.name, photo: authorPhoto, headerUrl: author.username, userId: userIsLoggedInAuthor, username: author.username })
    }
    catch (err) {
        err = new Error("This page could not be found.");
        err.status = 404;
        next(err);
    }
});

// GET /:username/:page
router.get('/:username/:page', async (req, res, next) => {
    try {
        const author = await User.findOne({ where: { username: req.params.username } })
        const userIsLoggedInAuthor = (author.id === res.locals.userId) ? true : false 

        // select posts to show on page 
        const page = parseInt(req.params.page);
        const queryOffset = (page - 1) * postsPerPage;
        // only show draft posts if user is logged in and is the author
        const allowedStatuses = userIsLoggedInAuthor ? ['live', 'draft'] : ['live']
        const posts = await Post.findAll({
            where: {
                UserId: author.id,
                status: allowedStatuses
            },
            order: [['createdAt', 'DESC']],
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
                UserId: author.id,
                status: allowedStatuses
            }
        });
        const nextPage = (postCount > maxViewedPosts) ? `/${author.username}/${page + 1}` : null;

        // get author photo
        let formattedName = author.name.replace(' ', '+')
        let defaultAvatar = `https://ui-avatars.com/api/?name=${formattedName}`
        const authorPhoto = author.photo ? `/static/uploads/${author.photo}` : defaultAvatar

        res.render('index', { posts, nextPage, title: author.name, name: author.name, photo: authorPhoto, headerUrl: `/${author.username}`, userId: userIsLoggedInAuthor, username: author.username });
    }
    catch (err) {
        err = new Error('This page could not be found.');
        err.status = 404;
        next(err);
    }
});

module.exports = router;