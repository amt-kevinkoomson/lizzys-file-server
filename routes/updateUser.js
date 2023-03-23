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
var exp = require('express');
var activateRouter = exp.Router();
var update = require('../models/database').updateUser;
var getU = require('../models/database').getUserByEmail;
var getUserByT = require('../models/database').getUserByToken;
var updateUserToke = require('../models/database').updateUserToken;
var updatePass = require('../models/database').updatePassword;
var bc = require('bcrypt');
var transpor = require('../middlewares/nodemailer');
var removeSla = require('../middlewares/helpers').removeSlash;
activateRouter.get('/activate/:hash', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var hash;
    return __generator(this, function (_a) {
        hash = req.params.hash;
        console.log('active');
        try {
            if (hash)
                update(hash).then(function () {
                    return res.render('index', {
                        success: 'Account successfully updated. Please sign in'
                    });
                });
        }
        catch (e) {
            console.log(e);
            res.render('confirm', {
                text: 'Something went wrong. Please try again or contact us'
            });
        }
        return [2 /*return*/];
    });
}); });
activateRouter.get('/forgot', function (req, res) {
    res.render('forgot', {
        code: null
    });
});
activateRouter.post('/forgot', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var email, user, e_1;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                email = req.body.resetEmail;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, getU(email)];
            case 2:
                user = _a.sent();
                if (user.email === email) {
                    bc.genSalt(10, function (err2, salt) {
                        if (err2)
                            console.log(err2);
                        else {
                            bc.hash(email, salt, function (err3, hash) { return __awaiter(_this, void 0, void 0, function () {
                                var resetToken, expirationDate, expirationString, mess, mailOptions;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!err3) return [3 /*break*/, 1];
                                            console.log(err3);
                                            return [3 /*break*/, 3];
                                        case 1:
                                            resetToken = removeSla(hash);
                                            expirationDate = new Date();
                                            expirationDate.setHours(expirationDate.getHours() + 1);
                                            expirationString = expirationDate.toISOString();
                                            return [4 /*yield*/, updateUserToke(resetToken, email, expirationString)];
                                        case 2:
                                            _a.sent();
                                            mess = 'Please do not share the following link with anyone. This link expires after one hour. Please click the link to be redirected to a password reset page:' + '\n' + 'https://lizzys-designs.onrender.com/reset/' + resetToken;
                                            mailOptions = {
                                                to: email,
                                                subject: 'Password Reset at Lizzy\'s Designs',
                                                text: mess
                                            };
                                            transpor.sendMail(mailOptions, function (err, info) {
                                                if (err)
                                                    console.log(err);
                                                console.log(info);
                                                res.render('reset-sent', {
                                                    code: 200
                                                });
                                            });
                                            _a.label = 3;
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); });
                        }
                    });
                }
                else {
                    res.render('confirm', {
                        text: 'No user with that email. Please sign up or contact us!'
                    });
                }
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                console.log('error thrown');
                console.log(e_1);
                res.render('reset-sent', {
                    code: 400,
                    async: true
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
activateRouter.get('/reset/:hash', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var resetToken, user, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                resetToken = req.params.hash;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, getUserByT(resetToken)];
            case 2:
                user = _a.sent();
                if (!user)
                    res.send('Invalid token');
                if (user && Date.now() <= user.expiration) {
                    res.render('reset-form', {
                        hash: resetToken
                    });
                }
                else {
                    res.send('Token expired');
                }
                return [3 /*break*/, 4];
            case 3:
                e_2 = _a.sent();
                console.log(e_2);
                res.send('Something went wrong. Please try again or contact us');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
activateRouter.post('/reset/:hash', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var hash, newPassword, user, hashPass, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                hash = req.params.hash;
                newPassword = req.body.password2;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 8, , 9]);
                return [4 /*yield*/, getUserByT(hash)];
            case 2:
                user = _a.sent();
                if (!!user) return [3 /*break*/, 3];
                res.send('Invalid Token');
                return [3 /*break*/, 7];
            case 3:
                if (!(user && Date.now() >= user.expiration)) return [3 /*break*/, 4];
                res.send('The provided link expired');
                return [3 /*break*/, 7];
            case 4:
                if (!(user.reset_token === hash && Date.now() <= user.expiration)) return [3 /*break*/, 7];
                return [4 /*yield*/, bc.hash(newPassword, 10)];
            case 5:
                hashPass = _a.sent();
                return [4 /*yield*/, updatePass(user.email, hashPass).then(function () {
                        console.log('password reset');
                        res.render('index', {
                            success: 'Your password has been reset successfully. Please sign in'
                        });
                    })];
            case 6:
                _a.sent();
                _a.label = 7;
            case 7: return [3 /*break*/, 9];
            case 8:
                e_3 = _a.sent();
                console.log(e_3);
                res.send('Something went wrong. Please try again or contact us');
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); });
module.exports = activateRouter;
