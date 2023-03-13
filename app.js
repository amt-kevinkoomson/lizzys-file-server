var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var methodOverride = require('method-override');
var db = require('./db/index');
db.connect();
var bcrypt = require('bcrypt');
var passport = require('passport');
var flash = require('express-flash');
var session = require('express-session');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'akme.africa15@gmail.com',
        pass: process.env.MAILER_PASS
    }
});
var multer = require('multer');
var fileStorageEngine = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '--' + file.originalname);
    }
});
var upload = multer({
    storage: fileStorageEngine
});
var initializePassport = require('./passport-config');
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
app.get("/", checkNotAuthenticated, function (req, res) {
    console.log("GET /");
    res.render('index', {
        success: null
    });
});
app.get("/dashboard", checkAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var adminStatus;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("GET dashboard");
                adminStatus = req.user.admin_status;
                return [4 /*yield*/, db.query("SELECT * FROM files ORDER BY downloads DESC", function (err, res2) {
                        var files = res2.rows;
                        res.render('dashboard', {
                            name: req.user.name,
                            isAdmin: adminStatus,
                            items: files,
                            number: files.length
                        });
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
app.get('/search', checkAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var query, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = req.query.q;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 5]);
                return [4 /*yield*/, db.query("SELECT * FROM files WHERE title ILIKE $1", ['%' + query + '%'], function (err, result) {
                        if (err)
                            console.log(err);
                        var files = result.rows;
                        res.render('search-results', {
                            name: req.user.name,
                            isAdmin: req.user.admin_status,
                            items: files
                        });
                    })];
            case 2:
                _a.sent();
                return [3 /*break*/, 5];
            case 3:
                e_1 = _a.sent();
                console.log(e_1);
                return [4 /*yield*/, db.query("SELECT * FROM files ORDER BY downloads DESC", function (err, res2) {
                        var files = res2.rows;
                        res.render('dashboard', {
                            name: req.user.name,
                            isAdmin: req.user.admin_status,
                            items: files,
                            number: files.length
                        });
                    })];
            case 4:
                _a.sent();
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.get("/signup", checkNotAuthenticated, function (req, res) {
    res.render('signup');
});
app.get("/upload", checkAuthenticated, function (req, res) {
    if (!req.user.admin_status)
        res.redirect('/dashboard');
    else
        res.render('upload', {
            name: req.user.name,
            code: null
        });
});
app.post("/upload", checkAuthenticated, upload.single('designFile'), function (req, res) {
    console.log(req.file);
    console.log(req.user.id);
    try {
        db.query("INSERT INTO files (location, added_by, downloads, sent, title, description, filename) VALUES($1, $2, $3, $4, $5, $6, $7)", [req.file.path, req.user.id, 0, 0, req.body.titleText, req.body.description, req.file.filename], function (err, res2) {
            if (err)
                console.log(err);
            console.log(res2.command + res2.oid + res2.rowCount);
            res.render('upload', {
                name: req.user.name,
                isAdmin: req.user.admin_status,
                code: res.statusCode
            });
        });
    }
    catch (e) {
        console.log(e);
        res.render('upload', {
            name: req.user.name,
            isAdmin: req.user.admin_status,
            code: null
        });
    }
});
app.get('/download/:fileId', checkAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var fileId, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fileId = req.params.fileId;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, db.query('SELECT * FROM files WHERE id = $1', [fileId], function (err, result) {
                        var file = result.rows[0];
                        var path = __dirname + '\\' + file.location;
                        res.setHeader('Content-Disposition', 'attachment; filename=' + __dirname + '\\' + result.rows[0].filename);
                        res.download(path, function (err) {
                            if (err)
                                console.log(err);
                        });
                        db.query("UPDATE files SET downloads = $1 WHERE id = $2", [file.downloads + 1, fileId], function (err, res3) {
                            if (err) {
                                console.error(err);
                            }
                            console.log('download record updated');
                        });
                    })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_2 = _a.sent();
                console.log(e_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/sendEmail/:fileId', checkAuthenticated, function (req, res) {
    var fileId = req.params.fileId;
    try {
        db.query("SELECT title FROM files WHERE id = $1", [fileId], function (err, result) {
            if (err)
                console.log(err);
            res.render('sendEmail', {
                name: req.user.name,
                isAdmin: req.user.admin_status,
                title: result.rows[0].title,
                id: fileId,
                code: null
            });
        });
    }
    catch (e) {
        console.log(e);
    }
});
app.post('/sendEmail/:id', checkAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db.query("SELECT * FROM files WHERE id = $1", [req.params.id], function (err, result) {
                    var recipientEmail = req.body.recipientEmail;
                    var subject = req.body.subject;
                    var message = req.body.message;
                    var filePath = '.\\' + result.rows[0].location;
                    var fileName = result.rows[0].filename;
                    var mailOptions = {
                        from: 'akme.africa15@gmail.com',
                        to: recipientEmail,
                        subject: subject,
                        text: message,
                        attachments: [{
                                filename: fileName,
                                path: filePath
                            }]
                    };
                    transporter.sendMail(mailOptions, function (err, info) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (err)
                                        console.log(err);
                                    return [4 /*yield*/, db.query("UPDATE files SET sent = $1 WHERE id = $2", [result.rows[0].sent + 1, result.rows[0].id], function (e, res2) {
                                            if (e)
                                                console.log(e);
                                            console.log(info);
                                            res.render('sendEmail', {
                                                name: req.user.name,
                                                isAdmin: req.user.admin_status,
                                                title: result.rows[0].title,
                                                id: req.params.id,
                                                code: 200
                                            });
                                        })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
app.get('/forgot', function (req, res) {
    res.render('forgot', {
        code: null
    });
});
app.post('/forgot', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var email, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                email = req.body.resetEmail;
                console.log(email);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, db.query("SELECT * FROM users WHERE email = $1", [email], function (err, result1) {
                        if (err) {
                            console.log(err);
                        }
                        var user = result1.rows[0];
                        if (user && user.email === email) {
                            bcrypt.genSalt(10, function (err2, salt) {
                                if (err2)
                                    console.log(err2);
                                bcrypt.hash(email, salt, function (err3, hash) {
                                    if (err3)
                                        console.log(err3);
                                    var resetToken = removeSlash(hash);
                                    var expirationDate = new Date();
                                    expirationDate.setHours(expirationDate.getHours() + 1);
                                    var expirationString = expirationDate.toISOString();
                                    db.query("UPDATE users SET reset_token = $1, expiration = $2 WHERE id = $3", [resetToken, expirationString, user.id], function (err2, res2) {
                                        if (err)
                                            console.log(err2);
                                    });
                                    var mess = 'Please do not share the following link with anyone. This link expires after one hour. Please click the link to be redirected to a password reset page:' + '\n' + 'https://lizzys-designs.onrender.com/reset/' + resetToken;
                                    var mailOptions = {
                                        to: email,
                                        subject: 'Password Reset at lizzy\'s Designs',
                                        text: mess
                                    };
                                    transporter.sendMail(mailOptions, function (err, info) {
                                        if (err)
                                            console.log(err);
                                        console.log(info);
                                        res.render('reset-sent', {
                                            code: 200
                                        });
                                    });
                                });
                            });
                        }
                        else {
                            console.log('wrong email');
                            res.render('forgot', {
                                code: 400
                            });
                        }
                        ;
                    })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_3 = _a.sent();
                console.log('error thrown');
                console.log(e_3);
                res.render('reset-sent', {
                    code: 400,
                    async: true
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/reset/:hash', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var resetToken, e_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                resetToken = req.params.hash;
                console.log(resetToken);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, db.query("SELECT * FROM users WHERE reset_token = $1", [resetToken], function (err, result) {
                        if (err)
                            console.log(err);
                        var user = result.rows[0];
                        if (!user)
                            res.send('Invalid token');
                        if (user && Date.now() <= user.expiration) {
                            res.render('reset-form', {
                                hash: resetToken
                            });
                        }
                    })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_4 = _a.sent();
                console.log(e_4);
                res.send('Something went wrong. Please try again or contact us');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post('/reset/:hash', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var hash, newPassword, e_5;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                hash = req.params.hash;
                newPassword = req.body.password2;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, db.query('SELECT * FROM users WHERE reset_token = $1', [hash], function (err, result) { return __awaiter(_this, void 0, void 0, function () {
                        var user, hashPass;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (err)
                                        console.log(err);
                                    user = result.rows[0];
                                    console.log(user);
                                    if (!user) {
                                        res.send('Invalid token');
                                        return [2 /*return*/];
                                    }
                                    if (Date.now() >= user.expiration) {
                                        res.send('The provided link has expired.');
                                        return [2 /*return*/];
                                    }
                                    if (!(user.reset_token === hash && Date.now() <= user.expiration)) return [3 /*break*/, 2];
                                    return [4 /*yield*/, bcrypt.hash(newPassword, 10)];
                                case 1:
                                    hashPass = _a.sent();
                                    db.query('UPDATE users SET password = $1 WHERE reset_token = $2', [hashPass, hash], function (err2, result2) {
                                        if (err2)
                                            console.log(err2);
                                        console.log('changed?');
                                        var email = user.email;
                                        db.query('UPDATE users SET reset_token = $1, expiration = $2 WHERE email = $3', [null, null, email], function (err3, res3) {
                                            if (err3)
                                                console.log(err3);
                                            console.log('password reset success');
                                            res.render('index', {
                                                success: 'Your password has been reset successfully. Please sign in'
                                            });
                                        });
                                    });
                                    _a.label = 2;
                                case 2: return [2 /*return*/];
                            }
                        });
                    }); })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_5 = _a.sent();
                console.log(e_5);
                res.send('Something went wrong. Please contact us');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post("/signup", checkNotAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var email, password, e_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                email = req.body.email;
                return [4 /*yield*/, bcrypt.hash(req.body.password, 10)];
            case 1:
                password = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, bcrypt.genSalt(10, function (err, salt) {
                        if (err)
                            console.log(err);
                        bcrypt.hash(email, salt, function (err2, hash) {
                            if (err2)
                                console.log(err2);
                            var activation = removeSlash(hash);
                            db.query("INSERT INTO users (name, email, password, admin_status, is_active, activation) VALUES ($1, $2, $3, $4, $5, $6)", [req.body.name, email, password, false, false, activation], function (err4, result) {
                                if (err4)
                                    console.log(err4);
                                console.log(result);
                            });
                            var mess = 'Please click the link to activate your account at Lizzy\'s designs:' + '\n' + 'https://lizzys-designs.onrender.com/activate/' + activation;
                            var mailOptions = {
                                to: email,
                                subject: 'Account activation at lizzy\'s Designs',
                                text: mess
                            };
                            transporter.sendMail(mailOptions, function (err3, info) {
                                if (err3)
                                    console.log(err3);
                                console.log(info);
                                res.render('index', { success: 'Please check your mail for your account activation link' });
                            });
                        });
                    })];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                e_6 = _a.sent();
                console.log(e_6);
                res.render('confirm', { text: 'Something went wrong. Please try again or contact us' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.get('/activate/:hash', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var hash, email, e_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                hash = req.params.hash;
                console.log('active');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, db.query('UPDATE users SET is_active = $1, activation = $2 WHERE activation = $3', [true, null, hash], function (err, result) {
                        if (err)
                            console.log(err);
                        console.log(result);
                        res.render('index', { success: 'Account successfully updated. Please sign in' });
                    })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_7 = _a.sent();
                console.log(e_7);
                res.render('confirm', { text: 'Something went wrong. Please try again or contact us' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app["delete"]('/logout', function (req, res) {
    req.logOut(function () { });
    res.redirect('/');
});
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated())
        return res.redirect('/dashboard');
    next();
}
function removeSlash(inputString) {
    return inputString.replace(/\//g, '');
}
app.listen(3000, function () {
    console.log('Server running on port 3000\n');
});
