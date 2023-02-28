var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var db = require('./db/index');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.get("/", function (req, res) {
    console.log("GET /");
    res.sendFile(__dirname + "/views/index.html");
});
app.post("/", function (req, res) {
    var data = req.body;
    console.log(res.statusCode);
    console.log(data);
});
app.listen(3000, function () {
    console.log('Server running on port 3000\n');
});
