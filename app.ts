require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const methodOverride = require('method-override');
const db = require('./db/index');
db.connect();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');


const initializePassport = require('./passport-config');



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

initializePassport(passport);
app.post("/", passport.authenticate('local', {
    successRedirect: 'dashboard',
    failureRedirect: '/',
    failureFlash: true
}));

app.get("/", checkNotAuthenticated, (req,res)=>{
    console.log("GET /");
    res.render('index');
});

app.get("/dashboard", checkAuthenticated, (req, res) => {
    console.log("GET dashboard");
    res.render('dashboard', { name: req.user.name});
})

app.get("/signup", checkNotAuthenticated, (req, res)=>{
    console.log('GET /signup');
    res.render('signup');
});

app.post("/signup", checkNotAuthenticated, async (req,res)=>{
    console.log("POST to /signup");
    db.connect();
    try{
        const hash = await bcrypt.hash(req.body.password, 10);
        db.query(
            "INSERT INTO users (name, email, password, admin_status) VALUES($1, $2, $3, $4)",
            [req.body.name, req.body.email, hash, false],
            (err, res)=>{
                if(err) throw err;
                console.log(res);
                db.end();
            }
        )
        res.render('index');
    } catch(e){
        console.log(e);
    }
});
app.delete('/logout', (req, res) => {
    req.logOut(()=>{})
    res.redirect('/')
});

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) return next();
    res.redirect('/')
}
function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) return res.redirect('/dashboard');
    next();
}

app.listen(3000, ()=>{
    console.log('Server running on port 3000\n');
});