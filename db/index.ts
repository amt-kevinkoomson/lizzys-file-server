const { Client } = require('pg');

const { client } = new Client({
    user: 'kevo',
    database: 'phase3',
    password: 'phase3proj',
    port: 5432,
    host: 'localhost'
});

module.exports = { client };