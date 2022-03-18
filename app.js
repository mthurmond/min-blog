const express = require('express'); 
const bodyParser = require('body-parser');  
const session = require('express-session'); 
const app = express();

let port = process.env.PORT || 3000;

// manage user sessions
app.use(session({
    secret: '', 
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

const routes = require('./routes'); 
app.use(routes); 

app.use((req, res, next) => {
    console.log('error function ran'); 
    const err = new Error('Not Found'); 
    err.status = 404;
    next(err); 
});

app.use((err, req, res, next) => {
    console.log('error function 2 ran'); 
    res.locals.error = err; 
    res.render('error');
})

app.listen(port, () => {
    console.log(`app is now running on port ${port}`); 
}); 