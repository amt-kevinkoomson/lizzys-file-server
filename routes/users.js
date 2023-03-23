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
var expres = require('express');
var router = expres.Router();
var bodyParser = require('body-parser');
var passport = require('passport');
var bcrypt2 = require('bcrypt');
var methodOverride = require('method-override');
var getUserByE = require('../models/database').getUserByEmail;
var getUserByI = require('../models/database').getUserById;
var getFil = require('../models/database').getFiles;
var createU = require('../models/database').createUser;
var removeSlas = require('../middlewares/helpers').removeSlash;
var checkAuthenticate = require('../middlewares/helpers').checkAuthenticated;
var checkNotAuthenticate = require('../middlewares/helpers').checkNotAuthenticated;
var transport = require('../middlewares/nodemailer');
var flash = require('express-flash');
var session = require('express-session');
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
var initializePassport = require('../middlewares/passport');
router.use(passport.initialize());
router.use(passport.session());
initializePassport(passport, getUserByE, getUserByI);
router.get('/', checkNotAuthenticate, function (req, res) {
    res.render('index', {
        success: null
    });
});
router.post("/", passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/',
    failureFlash: true
}));
router.get("/dashboard", checkAuthenticate, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var files;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getFil()];
            case 1:
                files = _a.sent();
                res.render('dashboard', {
                    name: req.user.name,
                    isAdmin: req.user.admin_status,
                    items: files,
                    number: files.length
                });
                return [2 /*return*/];
        }
    });
}); });
/* ------------------Sign-up--------------------------- */
router.get("/signup", checkNotAuthenticate, function (req, res) {
    res.render('signup');
});
router.post("/signup", checkNotAuthenticate, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var email, name, password, activation, e_1;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                email = req.body.email;
                name = req.body.name;
                return [4 /*yield*/, bcrypt2.hash(req.body.password, 10)];
            case 1:
                password = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, bcrypt2.genSalt(10, function (err, salt) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!err) return [3 /*break*/, 1];
                                    console.log(err);
                                    return [3 /*break*/, 3];
                                case 1: return [4 /*yield*/, bcrypt2.hash(email, salt, function (err2, hash) { return __awaiter(_this, void 0, void 0, function () {
                                        var activation_1, result, mess, mailOptions;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    if (!err2) return [3 /*break*/, 1];
                                                    console.log(err2);
                                                    return [3 /*break*/, 3];
                                                case 1:
                                                    activation_1 = removeSlas(hash);
                                                    return [4 /*yield*/, createU(name, email, password, false, false, activation_1)];
                                                case 2:
                                                    result = _a.sent();
                                                    mess = 'Please click the link to activate your account at Lizzy\'s designs:' + '\n' + 'https://lizzys-designs.onrender.com/activate/' + activation_1;
                                                    mailOptions = {
                                                        to: email,
                                                        subject: 'Account activation at lizzy\'s Designs',
                                                        text: mess
                                                    };
                                                    transport.sendMail(mailOptions, function (err3, info) {
                                                        if (err3)
                                                            console.log(err3);
                                                        else {
                                                            console.log(info);
                                                            res.render('index', {
                                                                success: 'Please check your mail for your account activation link'
                                                            });
                                                        }
                                                    });
                                                    _a.label = 3;
                                                case 3: return [2 /*return*/];
                                            }
                                        });
                                    }); })];
                                case 2: return [2 /*return*/, _a.sent()];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            case 3:
                activation = _a.sent();
                return [3 /*break*/, 5];
            case 4:
                e_1 = _a.sent();
                console.log(e_1);
                res.render('confirm', {
                    text: 'Something went wrong. Please try again or contact us'
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
router["delete"]('/logout', function (req, res) {
    req.logOut(function () { });
    res.redirect('/');
});
module.exports = router;
