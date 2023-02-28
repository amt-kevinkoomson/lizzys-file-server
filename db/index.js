var Client = require('pg').Client;
var client = new Client({
    user: 'kevo',
    database: 'phase3',
    password: 'phase3proj',
    port: 5432,
    host: 'localhost'
}).client;
module.exports = { client: client };
