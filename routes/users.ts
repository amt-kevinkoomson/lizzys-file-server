require('dotenv').config();
const expres = require('express');
const router = expres.Router();
const bodyParser = require('body-parser');
const passport = require('passport');
const bcrypt2 = require('bcrypt');
const methodOverride = require('method-override');

const getUserByE = require('../models/database').getUserByEmail;
const getUserByI = require('../models/database').getUserById;
const getFil = require('../models/database').getFiles;
const createU = require('../models/database').createUser;
const removeSlas = require('../middlewares/helpers').removeSlash;
const checkAuthenticate = require('../middlewares/helpers').checkAuthenticated;
const checkNotAuthenticate = require('../middlewares/helpers').checkNotAuthenticated

const transport = require('../middlewares/nodemailer');

const flash = require('express-flash');
const session = require('express-session');
router.use(bodyParser.urlencoded({
    extended: true
}));

router.use(flash());
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
router.use(methodOverride('_method'));
const initializePassport = require('../middlewares/passport');
router.use(passport.initialize());
router.use(passport.session());
initializePassport(passport, getUserByE, getUserByI);

router.get('/', checkNotAuthenticate, (req, res) => {
    res.render('index', {
        success: null
    })
})
router.post("/", passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/',
    failureFlash: true
}));

router.get("/dashboard", checkAuthenticate, async (req, res) => {
    const files = await getFil();
    res.render('dashboard', {
        name: req.user.name,
        isAdmin: req.user.admin_status,
        items: files,
        number: files.length
    });
})
/* ------------------Sign-up--------------------------- */
router.get("/signup", checkNotAuthenticate, (req, res) => {
    res.render('signup');
});

router.post("/signup", checkNotAuthenticate, async (req, res) => {
    let email = req.body.email;
    let name = req.body.name;
    const password = await bcrypt2.hash(req.body.password, 10);
    try {
        const activation = await bcrypt2.genSalt(10, async (err, salt) => {
            if (err) console.log(err)
            else return await bcrypt2.hash(email, salt, async (err2, hash) => {
                if (err2) console.log(err2)
                else {
                    const activation = removeSlas(hash);
                    // console.log(activation);
                    const result = await createU(name, email, password, false, false, activation);
                    const mess = 'Please click the link to activate your account at Lizzy\'s designs:' + '\n' + 'https://lizzys-designs.onrender.com/activate/' + activation;
                    const mailOptions = {
                        to: email,
                        subject: 'Account activation at lizzy\'s Designs',
                        text: mess
                    }
                    transport.sendMail(mailOptions, (err3, info) => {
                        if (err3) console.log(err3)
                        else {
                            console.log(info);
                            res.render('index', {
                                success: 'Please check your mail for your account activation link'
                            });
                        }
                    })
                }
            })
        })
    } catch (e) {
        console.log(e);
        res.render('confirm', {
            text: 'Something went wrong. Please try again or contact us'
        });
    }
});
router.delete('/logout', (req, res) => {
    req.logOut(() => {})
    res.redirect('/')
});


module.exports = router;