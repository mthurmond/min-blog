require('dotenv').config();
const express = require('express'); 
const bodyParser = require('body-parser');  
const session = require('express-session'); 
const app = express();

let port = process.env.PORT || 3000;

// manage user sessions
app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: true, 
    saveUninitialized: false
}));

app.use(function(req, res, next) {
    res.locals.loggedIn = req.session.userId; 
    next(); 
});

app.use(bodyParser.urlencoded({ extended: false })); 

app.use('/static', express.static('public')); 

app.set('view engine', 'pug'); 

if(process.env.NODE_ENV === 'production') { 
    app.use((req, res, next) => {
        console.log(req.secure, req.header('x-forwarded-proto'));
        
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });
}

const routes = require('./routes'); 
app.use(routes); 

// ERROR HANDLERS
// 404 error handler
app.use((req, res, next) => {
    console.log('404 error handler ran'); 
    const err = new Error('This page could not be found.'); 
    err.status = 404;
    next(err); 
});

// general error handler
app.use((err, req, res, next) => {
    console.log('general error handler ran'); 
    err.message = err.message || 'There was an error.';
    err.status = err.status || 500;
    const environment = process.env.NODE_ENV;
    res.status(err.status || 500).render('error', { error: err, environment: environment } );
});

app.listen(port, () => {
    console.log(`app is now running on port ${port}`); 
}); 