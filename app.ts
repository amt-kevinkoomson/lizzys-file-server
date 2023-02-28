const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = require('./db/index');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", (req,res)=>{
    console.log("GET /");
    res.sendFile(__dirname+"/views/index.html");
});

app.post("/", (req,res)=>{
    const data = req.body;
    console.log(res.statusCode);
    console.log(data);
});

app.listen(3000, ()=>{
    console.log('Server running on port 3000\n');
});