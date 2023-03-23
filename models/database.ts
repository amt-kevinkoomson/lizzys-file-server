require('dotenv').config();
const {
    Client
} = require('pg');

const client = new Client({
    // ssl: { rejectUnauthorized: false },
    user: 'kevo',
    password: 'phase3proj',
    host: 'localhost',
    port: 5432,
    database: 'phase3'
});

try {
    client.connect((err) => {
        if (err) {
            console.error('db connection error', err.stack)
        } else {
            console.log('connected to db')
        }
    });
} catch (e) {
    console.log(e);
}
const getUserByEmail = async (email: String) => {
    //queries db and returns user
    try {
        const result = await client.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        return result.rows[0];
    } catch (e) {
        console.log(e);
    }
}
const getUserById = async (id: number) => {
    try {
        const user = await client.query(
            "SELECT * FROM users WHERE id = $1",
            [id]
        )
        return user.rows[0];
    } catch (e) {
        console.log(e);
    }
}
const getFiles = async () => {
    try {
        const files = await client.query(
            "SELECT * FROM files ORDER BY downloads DESC"
        )
        const res = files.rows;
        return res;
    } catch (e) {
        console.log(e)
    }
}
const createUser = async (name: string, email: string, password: string, admin: boolean, active: boolean, activation: string) => {
    const result = await client.query(
        "INSERT INTO users (name, email, password, admin_status, is_active, activation) VALUES ($1, $2, $3, $4, $5, $6)",
        [name, email, password, admin, active, activation],
        (err, res) => {
            if (err) {
                console.log(err);
                return false;
            } else {
                return true;
            }
        }
    )
    return result;
}
const updateUser = async (activation: string) => {
    const result = await client.query(
        'UPDATE users SET is_active = $1, activation = $2 WHERE activation = $3',
        [true, null, activation],
    )
}
const updateUserToken = async (token:string, email:string, expiration:string) => {
    const result = await client.query(
        'UPDATE users SET reset_token = $1, expiration = $2 WHERE email = $3',
        [token, expiration, email],
    )
}
const getUserByToken = async (token: string) => {
    try {
        const result = await client.query(
            "SELECT * FROM users WHERE reset_token = $1",
            [token]
        );
        return result.rows[0];
    } catch (e) {
        console.log(e);
    }
}
const updatePassword = async (email:string, password: string) => {
    try {
        await client.query(
            'UPDATE users SET password = $1, reset_token = $2, expiration = $3 WHERE email = $4',
            [password, null, null, email]
        )
    } catch(e) {
        console.log(e);
    }
}

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
}