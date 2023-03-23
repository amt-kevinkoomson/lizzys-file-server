require('dotenv').config();
var express = require('express');
var app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
var userRouter = require('./routes/users');
var actRouter = require('./routes/updateUser');
var fRouter = require('./routes/files');
app.use('/', userRouter);
app.use('/', actRouter);
app.use('/', fRouter);
app.listen(process.env.PORT || 3000, function () {
    console.log('listening on port ' + process.env.PORT);
});
module.exports = app;
