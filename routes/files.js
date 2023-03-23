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
var expresser = require('express');
var fileRouter = expresser.Router();
var checkAuth = require('../middlewares/helpers').checkAuthenticated;
var search = require('../models/files').searchFiles;
var getFs = require('../models/database').getFiles;
var addFs = require('../models/files').addFiles;
var getF = require('../models/files').getFile;
var updateDown = require('../models/files').updateDownloads;
var updateSnds = require('../models/files').updateSends;
var transpor = require('../middlewares/nodemailer');
var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});
var _a = require("@aws-sdk/client-s3"), S3Client = _a.S3Client, PutObjectCommand = _a.PutObjectCommand, GetObjectCommand = _a.GetObjectCommand;
var s3 = new S3Client({
    region: 'us-west-2'
});
//send email
fileRouter.post('/sendEmail/:id', checkAuth, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var fileId, recipientEmail, subject, message, file, input, command;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fileId = req.params.id;
                recipientEmail = req.body.recipientEmail;
                subject = req.body.subject;
                message = req.body.message;
                return [4 /*yield*/, getF(fileId)];
            case 1:
                file = _a.sent();
                input = {
                    "Bucket": "lizzyserverphase3",
                    "Key": file.filename
                };
                command = new GetObjectCommand(input);
                return [4 /*yield*/, s3.send(command)
                        .then(function (data) { return __awaiter(_this, void 0, void 0, function () {
                        var mailOptions;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    mailOptions = {
                                        from: 'akme.africa15@gmail.com',
                                        to: recipientEmail,
                                        subject: subject,
                                        text: message,
                                        attachments: [{
                                                filename: file.filename,
                                                content: data.Body
                                            }]
                                    };
                                    return [4 /*yield*/, transpor.sendMail(mailOptions)
                                            .then(function () { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        console.log('file sent');
                                                        return [4 /*yield*/, updateSnds(fileId, file.sent)
                                                                .then(function () { console.log('file records updated'); })];
                                                    case 1:
                                                        _a.sent();
                                                        res.render('sendEmail', {
                                                            name: req.user.name,
                                                            isAdmin: req.user.admin_status,
                                                            title: file.title,
                                                            id: req.params.id,
                                                            code: 200
                                                        });
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); })["catch"](function (e) {
                                            console.log(e);
                                            res.render('sendEmail', {
                                                name: req.user.name,
                                                isAdmin: req.user.admin_status,
                                                title: file.title,
                                                id: req.params.id,
                                                code: 400
                                            });
                                        })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
fileRouter.get('/sendEmail/:fileId', checkAuth, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var fileId, file, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fileId = req.params.fileId;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, getF(fileId)];
            case 2:
                file = _a.sent();
                res.render('sendEmail', {
                    name: req.user.name,
                    isAdmin: req.user.admin_status,
                    title: file.title,
                    id: fileId,
                    code: null
                });
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                console.log(e_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
//download file
fileRouter.get('/download/:fileId', checkAuth, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var fileId, file, input, command, data, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fileId = req.params.fileId;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                return [4 /*yield*/, getF(fileId)];
            case 2:
                file = _a.sent();
                input = {
                    "Bucket": "lizzyserverphase3",
                    "Key": file.filename
                };
                command = new GetObjectCommand(input);
                return [4 /*yield*/, s3.send(command)];
            case 3:
                data = _a.sent();
                console.log(data);
                return [4 /*yield*/, updateDown(fileId, file.downloads)];
            case 4:
                _a.sent();
                res.setHeader('Content-disposition', "attachment; filename=".concat(input.Key));
                res.setHeader('Content-type', data.ContentType);
                data.Body.pipe(res);
                return [3 /*break*/, 6];
            case 5:
                e_2 = _a.sent();
                console.log(e_2);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
//upload file
fileRouter.post("/upload", checkAuth, upload.single('designFile'), function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var params;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                params = {
                    "Bucket": "lizzyserverphase3",
                    "Key": req.file.originalname,
                    "Body": req.file.buffer
                };
                return [4 /*yield*/, s3.send(new PutObjectCommand(params))
                        .then(function (results) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log(results);
                                    return [4 /*yield*/, addFs(req.user.id, req.body.titleText, req.body.description, req.file.originalname)
                                            .then(function () {
                                            console.log('added to db');
                                            res.render('upload', {
                                                name: req.user.name,
                                                isAdmin: req.user.admin_status,
                                                code: 200
                                            });
                                        })["catch"](function (e) {
                                            console.log(e);
                                            res.render('upload', {
                                                name: req.user.name,
                                                isAdmin: req.user.admin_status,
                                                code: 400
                                            });
                                        })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })["catch"](function (e) {
                        console.log(e);
                        res.render('upload', {
                            name: req.user.name,
                            isAdmin: req.user.admin_status,
                            code: 400
                        });
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
fileRouter.get("/upload", checkAuth, function (req, res) {
    if (!req.user.admin_status)
        res.redirect('/dashboard');
    else
        res.render('upload', {
            name: req.user.name,
            code: null
        });
});
fileRouter.get('/search', checkAuth, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var query, files, e_3, files;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = req.query.q;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 5]);
                return [4 /*yield*/, search(query)];
            case 2:
                files = _a.sent();
                res.render('search-results', {
                    name: req.user.name,
                    isAdmin: req.user.admin_status,
                    items: files
                });
                return [3 /*break*/, 5];
            case 3:
                e_3 = _a.sent();
                console.log(e_3);
                return [4 /*yield*/, getFs()];
            case 4:
                files = _a.sent();
                res.render('dashboard', {
                    name: req.user.name,
                    isAdmin: req.user.admin_status,
                    items: files,
                    number: files.length
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
module.exports = fileRouter;
