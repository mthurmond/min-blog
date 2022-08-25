require('dotenv').config();
const express = require('express'); 
const session = require('express-session'); 
const bodyParser = require('body-parser');  
const app = express();
// export app variable so it can be used in routes
exports.myApp = app;

let port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false })); 

app.use('/static', express.static('public')); 

app.set('view engine', 'pug'); 

// route all production http requests to https
// reference https://jaketrent.com/post/https-redirect-node-heroku
if(process.env.NODE_ENV === 'production') { 
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });
}

// hook up db
const { sequelize } = require('./db'); 
const db = require('./db'); 

// add session store
let SequelizeStore = require("connect-session-sequelize")(session.Store);
let myStore = new SequelizeStore({
    db: sequelize,
    expiration: 12 * 60 * 60 * 1000  // 12hr expiration, in milliseconds 
}); 

// manage user sessions
app.use(session({
    secret: process.env.SESSION_SECRET, 
    store: myStore,
    resave: false, //session store supports 'touch' method, so this must be false
    proxy: true,
    saveUninitialized: false
}));

// creates db and table(s)
// pass { alter: true } to push db updates like adding/editing columns, tables, etc. 
// *Only* pass { force: true } to drop all tables and recreate db
db.sequelize.sync({ alter: true }); 

app.use(function(req, res, next) {
    res.locals.loggedIn = req.session.userId; 
    next(); 
});

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
    console.log(`Express blog is now running on port ${port}.`); 
}); 