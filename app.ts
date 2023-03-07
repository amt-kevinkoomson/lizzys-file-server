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

const multer = require('multer');
const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '--' + file.originalname)
    }
})
const upload = multer({
    storage: fileStorageEngine
});


const initializePassport = require('./passport-config');



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
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

app.get("/", checkNotAuthenticated, (req, res) => {
    console.log("GET /");
    res.render('index');
});


/**
 * get arrary of files from fs
 */

app.get("/dashboard", checkAuthenticated, async (req, res) => {
    console.log("GET dashboard");
    const adminStatus = req.user.admin_status; 
    let files;
    await db.query("SELECT * FROM files",(err, res2) => {
        console.log(res2.rows);
        files = res2.rows;
        console.log(typeof files);
        res.render('dashboard', {
            name: req.user.name,
            isAdmin: adminStatus,
            items: files
        });        
    });
    
})

app.get("/signup", checkNotAuthenticated, (req, res) => {
    console.log('GET /signup');
    res.render('signup');
});

app.get("/upload", checkAuthenticated, (req, res) => {
    if (!req.user.admin_status) res.redirect('/dashboard')
    else res.render('upload', {
        name: req.user.name,
        code: null
    });
});

app.post("/upload", checkAuthenticated, upload.single('designFile'), (req, res) => {
    console.log(req.file);
    console.log(req.user.id);
    try {
        db.query("INSERT INTO files (location, added_by, downloads, sent, title, description, filename) VALUES($1, $2, $3, $4, $5, $6, $7)",
            [req.file.path, req.user.id, 0, 0, req.body.titleText, req.body.description, req.file.filename],
            (err, res2) => {
                if (err) throw err;
                console.log(res2.command + res2.oid + res2.rowCount);
                res.render('upload', {
                    name: req.user.name,
                    isAdmin: req.user.admin_status,
                    code: res.statusCode
                });
            }
        )
    } catch (e) {
        console.log(e);
        res.render('upload', {
            name: req.user.name,
            isAdmin: req.user.admin_status,
            code: null
        });
    }
});

app.post("/signup", checkNotAuthenticated, async (req, res) => {
    console.log("POST to /signup");
    try {
        const hash = await bcrypt.hash(req.body.password, 10);
        db.query(
            "INSERT INTO users (name, email, password, admin_status) VALUES($1, $2, $3, $4)",
            [req.body.name, req.body.email, hash, false],
            (err, res) => {
                if (err) throw err;
                console.log(res);
            }
        )
        res.render('index');
    } catch (e) {
        console.log(e);
    }
});
app.delete('/logout', (req, res) => {
    req.logOut(() => {})
    res.redirect('/')
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return res.redirect('/dashboard');
    next();
}
async function getAdminStatus(email: string): Promise < boolean > {
    const status = await db.query(
        "SELECT admin_status FROM users WHERE email = $1", [email]
    )
    if (status === 't') return true;
    return false;

}

app.listen(3000, () => {
    console.log('Server running on port 3000\n');
});