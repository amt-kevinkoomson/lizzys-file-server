require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');

const userRouter = require('./routes/users');
const actRouter = require('./routes/updateUser');
const fRouter = require('./routes/files');

app.use('/', userRouter);
app.use('/',actRouter);
app.use('/', fRouter);


app.listen( process.env.PORT || 3000, () => {
    console.log('listening on port ' + process.env.PORT);
})

module.exports = app