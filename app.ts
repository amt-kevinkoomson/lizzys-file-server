require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const methodOverride = require('method-override');
const db = require('./db/index');

try {
    db.connect((err) => {
        if (err) {
            console.error('db connection error', err.stack)
        } else {
            console.log('connected to db')
        }
    });
} catch(e) {
    console.log(e);
}
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');


const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'akme.africa15@gmail.com',
        pass: process.env.MAILER_PASS
    }
});

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

const initializePassport = require('./passport-config');

app.set('view engine', 'ejs');

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
    res.render('index', {
        success: null
    });
});


app.get("/dashboard", checkAuthenticated, async (req, res) => {
    console.log("GET dashboard");
    const adminStatus = req.user.admin_status;
    await db.query("SELECT * FROM files ORDER BY downloads DESC", (err, res2) => {
        const files = res2.rows;

        res.render('dashboard', {
            name: req.user.name,
            isAdmin: adminStatus,
            items: files,
            number: files.length
        });
    });

});

app.get('/search', checkAuthenticated, async (req, res) => {
    const query = req.query.q;
    try {
        await db.query(
            "SELECT * FROM files WHERE title ILIKE $1",
            ['%' + query + '%'],
            (err, result) => {
                if (err) console.log(err);
                const files = result.rows;
                res.render('search-results', {
                    name: req.user.name,
                    isAdmin: req.user.admin_status,
                    items: files,
                });

            }
        )
    } catch (e) {
        console.log(e);
        await db.query("SELECT * FROM files ORDER BY downloads DESC", (err, res2) => {
            const files = res2.rows;
            res.render('dashboard', {
                name: req.user.name,
                isAdmin: req.user.admin_status,
                items: files,
                number: files.length
            });
        });
    }
});

app.get("/signup", checkNotAuthenticated, (req, res) => {
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
                if (err)  console.log(err);
                console.log(res2.command + res2.oid + res2.rowCount);
                res.render('upload', {
                    name: req.user.name,
                    isAdmin: req.user.admin_status,
                    code: res.statusCode,

                });
            }
        )
    } catch (e) {
        console.log(e);
        res.render('upload', {
            name: req.user.name,
            isAdmin: req.user.admin_status,
            code: null,

        });
    }
});

app.get('/download/:fileId', checkAuthenticated, async (req, res) => {
    const fileId = req.params.fileId;
    try {
        await db.query(
            'SELECT * FROM files WHERE id = $1',
            [fileId],
            (err, result) => {
                const file = result.rows[0];
                const path = __dirname + '/' + file.location;

                res.setHeader('Content-Disposition', 'attachment; filename=' + __dirname + '\\' + result.rows[0].filename);

                res.download(path, (err) => {
                    if (err) console.log(err);
                });
                db.query(
                    "UPDATE files SET downloads = $1 WHERE id = $2",
                    [file.downloads + 1, fileId],
                    (err, res3) => {
                        if (err) {
                            console.error(err);
                        }
                        console.log('download record updated');
                    }
                )
            }
        )
    } catch (e) {
        console.log(e);
    }
});

app.get('/sendEmail/:fileId', checkAuthenticated, (req, res) => {
    const fileId = req.params.fileId;
    try {
        db.query(
            "SELECT title FROM files WHERE id = $1",
            [fileId],
            (err, result) => {
                if (err) console.log(err);
                res.render('sendEmail', {
                    name: req.user.name,
                    isAdmin: req.user.admin_status,
                    title: result.rows[0].title,
                    id: fileId,
                    code: null,

                });
            }
        )
    } catch (e) {
        console.log(e);
    }
});

app.post('/sendEmail/:id', checkAuthenticated, async (req, res) => {
    await db.query(
        "SELECT * FROM files WHERE id = $1",
        [req.params.id],
        (err, result) => {

            const recipientEmail = req.body.recipientEmail;
            const subject = req.body.subject;
            const message = req.body.message;

            const filePath = './' + result.rows[0].location;
            const fileName = result.rows[0].filename;

            const mailOptions = {
                from: 'akme.africa15@gmail.com',
                to: recipientEmail,
                subject: subject,
                text: message,
                attachments: [{
                    filename: fileName,
                    path: filePath
                }]
            };
            transporter.sendMail(mailOptions, async (err, info) => {
                if (err) console.log(err);
                await db.query(
                    "UPDATE files SET sent = $1 WHERE id = $2",
                    [result.rows[0].sent + 1, result.rows[0].id],
                    (e, res2) => {
                        if (e) console.log(e);
                        console.log(info);
                        res.render('sendEmail', {
                            name: req.user.name,
                            isAdmin: req.user.admin_status,
                            title: result.rows[0].title,
                            id: req.params.id,
                            code: 200,

                        });
                    }
                )
            });
        }
    )
})

app.get('/forgot', (req, res) => {
    res.render('forgot', {

        code: null
    });
});


app.post('/forgot', async (req, res) => {
    const email = req.body.resetEmail;
    console.log(email);
    try {
        await db.query(
            "SELECT * FROM users WHERE email = $1",
            [email],
            (err, result1) => {
                if (err) {
                    console.log(err);
                }
                let user = result1.rows[0];
                if (user && user.email === email) {
                    bcrypt.genSalt(10, (err2, salt) => {
                        if (err2) console.log(err2);
                        bcrypt.hash(email, salt, (err3, hash) => {
                            if (err3) console.log(err3);
                            const resetToken = removeSlash(hash);

                            const expirationDate = new Date();
                            expirationDate.setHours(expirationDate.getHours() + 1);
                            const expirationString = expirationDate.toISOString();
                            db.query(
                                "UPDATE users SET reset_token = $1, expiration = $2 WHERE id = $3",
                                [resetToken, expirationString, user.id],
                                (err2, res2) => {
                                    if (err) console.log( err2);
                                }
                            )
                            const mess = 'Please do not share the following link with anyone. This link expires after one hour. Please click the link to be redirected to a password reset page:' + '\n' + 'https://lizzys-designs.onrender.com/reset/' + resetToken;
                            const mailOptions = {
                                to: email,
                                subject: 'Password Reset at lizzy\'s Designs',
                                text: mess
                            }
                            transporter.sendMail(mailOptions, (err, info) => {
                                if (err) console.log( err);
                                console.log(info);
                                res.render('reset-sent', {
                                    code: 200
                                });
                            })

                        });
                    });

                } else {
                    console.log('wrong email');
                    res.render('forgot', {
                        code: 400,
                    });
                };
            }
        )
    } catch (e) {
        console.log('error thrown');
        console.log(e);
        res.render('reset-sent', {

            code: 400,
            async: true
        });
    }
});

app.get('/reset/:hash', async (req, res) => {
    const resetToken = req.params.hash;
    console.log(resetToken);
    try {
        await db.query(
            "SELECT * FROM users WHERE reset_token = $1",
            [resetToken],
            (err, result) => {
                if (err) console.log( err);
                const user = result.rows[0];
                if (!user) res.send('Invalid token');
                if (user && Date.now() <= user.expiration) {
                    res.render('reset-form', {
                        hash: resetToken
                    });
                }
            }
        )
    } catch (e) {
        console.log(e);
        res.send('Something went wrong. Please try again or contact us');
    }
});

app.post('/reset/:hash', async (req, res) => {
    const hash = req.params.hash;
    const newPassword = req.body.password2;
    try {
        await db.query(
            'SELECT * FROM users WHERE reset_token = $1',
            [hash],
            async (err, result) => {
                if (err) console.log( err);
                const user = result.rows[0];

                console.log(user);
                if (!user) {
                    res.send('Invalid token');
                    return;
                }
                if (Date.now() >= user.expiration) {
                    res.send('The provided link has expired.');
                    return;
                }
                if (user.reset_token === hash && Date.now() <= user.expiration) {
                    const hashPass = await bcrypt.hash(newPassword, 10);
                    db.query(
                        'UPDATE users SET password = $1 WHERE reset_token = $2',
                        [hashPass, hash],
                        (err2, result2) => {
                            if (err2) console.log( err2);
                            console.log('changed?');
                            const email = user.email;
                            db.query(
                                'UPDATE users SET reset_token = $1, expiration = $2 WHERE email = $3',
                                [null, null, email],
                                (err3, res3) => {
                                    if (err3) console.log( err3);
                                    console.log('password reset success');
                                    res.render('index', {
                                        success: 'Your password has been reset successfully. Please sign in'
                                    });
                                }
                            )
                        }
                    )
                }

            }
        )
    } catch (e) {
        console.log(e);
        res.send('Something went wrong. Please contact us');
    }
})

app.post("/signup", checkNotAuthenticated, async (req, res) => {
    let email = req.body.email;
    const password = await bcrypt.hash(req.body.password, 10);
    try {
        await bcrypt.genSalt(10, (err, salt) => {
            if(err) console.log(err);
            bcrypt.hash(email, salt, (err2, hash) => {
                if (err2) console.log(err2);
                const activation = removeSlash(hash);
                db.query(
                    "INSERT INTO users (name, email, password, admin_status, is_active, activation) VALUES ($1, $2, $3, $4, $5, $6)",
                    [ req.body.name, email, password, false, false, activation ],
                    (err4, result) => {
                        if (err4) console.log( err4);
                        console.log(result);
                    }
                )
                const mess = 'Please click the link to activate your account at Lizzy\'s designs:' + '\n' + 'https://lizzys-designs.onrender.com/activate/' + activation;
                const mailOptions = {
                    to: email,
                    subject: 'Account activation at lizzy\'s Designs',
                    text: mess
                }
                transporter.sendMail(mailOptions, (err3, info) => {
                    if (err3) console.log( err3);
                    console.log(info);
                    res.render('index', { success: 'Please check your mail for your account activation link' });
                })
            })
        })
        
    } catch (e) {
        console.log(e);
        res.render('confirm', { text: 'Something went wrong. Please try again or contact us' });
    }
});

app.get('/activate/:hash', async (req, res) => {
    const hash = req.params.hash;
    console.log('active');
    let email: string;
    try {
        await db.query(
            'UPDATE users SET is_active = $1, activation = $2 WHERE activation = $3',
            [ true, null, hash ],
            (err, result) => {
                if(err) console.log(err);
                console.log(result);
                res.render('index', { success: 'Account successfully updated. Please sign in' });
            }
        )
    } catch (e) {
        console.log(e);
        res.render('confirm', { text: 'Something went wrong. Please try again or contact us' });
    }
})

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

function removeSlash(inputString: string): string {
    return inputString.replace(/\//g, '');
}
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Server running on port '+port);
});