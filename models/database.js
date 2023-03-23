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
var Client = require('pg').Client;
var client = new Client({
    ssl: { rejectUnauthorized: false },
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE
});
try {
    client.connect(function (err) {
        if (err) {
            console.error('db connection error', err.stack);
        }
        else {
            console.log('connected to db');
        }
    });
}
catch (e) {
    console.log(e);
}
var getUserByEmail = function (email) { return __awaiter(_this, void 0, void 0, function () {
    var result, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, client.query("SELECT * FROM users WHERE email = $1", [email])];
            case 1:
                result = _a.sent();
                return [2 /*return*/, result.rows[0]];
            case 2:
                e_1 = _a.sent();
                console.log(e_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
var getUserById = function (id) { return __awaiter(_this, void 0, void 0, function () {
    var user, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, client.query("SELECT * FROM users WHERE id = $1", [id])];
            case 1:
                user = _a.sent();
                return [2 /*return*/, user.rows[0]];
            case 2:
                e_2 = _a.sent();
                console.log(e_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
var getFiles = function () { return __awaiter(_this, void 0, void 0, function () {
    var files, res, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, client.query("SELECT * FROM files ORDER BY downloads DESC")];
            case 1:
                files = _a.sent();
                res = files.rows;
                return [2 /*return*/, res];
            case 2:
                e_3 = _a.sent();
                console.log(e_3);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
var createUser = function (name, email, password, admin, active, activation) { return __awaiter(_this, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client.query("INSERT INTO users (name, email, password, admin_status, is_active, activation) VALUES ($1, $2, $3, $4, $5, $6)", [name, email, password, admin, active, activation], function (err, res) {
                    if (err) {
                        console.log(err);
                        return false;
                    }
                    else {
                        return true;
                    }
                })];
            case 1:
                result = _a.sent();
                return [2 /*return*/, result];
        }
    });
}); };
var updateUser = function (activation) { return __awaiter(_this, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client.query('UPDATE users SET is_active = $1, activation = $2 WHERE activation = $3', [true, null, activation])];
            case 1:
                result = _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var updateUserToken = function (token, email, expiration) { return __awaiter(_this, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client.query('UPDATE users SET reset_token = $1, expiration = $2 WHERE email = $3', [token, expiration, email])];
            case 1:
                result = _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var getUserByToken = function (token) { return __awaiter(_this, void 0, void 0, function () {
    var result, e_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, client.query("SELECT * FROM users WHERE reset_token = $1", [token])];
            case 1:
                result = _a.sent();
                return [2 /*return*/, result.rows[0]];
            case 2:
                e_4 = _a.sent();
                console.log(e_4);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
var updatePassword = function (email, password) { return __awaiter(_this, void 0, void 0, function () {
    var e_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, client.query('UPDATE users SET password = $1, reset_token = $2, expiration = $3 WHERE email = $4', [password, null, null, email])];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                e_5 = _a.sent();
                console.log(e_5);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
module.exports = {
    client: client,
    getUserByEmail: getUserByEmail,
    getUserById: getUserById,
    getFiles: getFiles,
    createUser: createUser,
    updateUser: updateUser,
    getUserByToken: getUserByToken,
    updateUserToken: updateUserToken,
    updatePassword: updatePassword
};
