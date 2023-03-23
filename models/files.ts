const db = require('./database').client;

const searchFiles = async (param:string) => {
    try {
        const results = await db.query(
            "SELECT * FROM files WHERE title ILIKE $1",
            ['%' + param + '%'],
        );
        return results.rows;
    } catch(e) {
        console.log(e);
    }
}
const addFiles = async (id: number, title:string, description:string, filename:string) => {
    try {
        await db.query(
            "INSERT INTO files (location, added_by, downloads, sent, title, description, filename) VALUES($1, $2, $3, $4, $5, $6, $7)",
            [null, id, 0, 0, title, description, filename]
        )
    } catch(e) {
        console.log(e);
    }
}
const getFile = async (id:number) => {
    try {
        const result = await db.query(
            'SELECT * FROM files WHERE id = $1',
            [ id ]
        );
        return result.rows[0];
    } catch(e) {
        console.log(e);
    }
}

const updateDownloads = async (id:number, downloads:number) => {
    try {
        db.query(
            "UPDATE files SET downloads = $1 WHERE id = $2",
            [ downloads+1, id]
        )
    } catch(e) {
        console.log(e);
    }
}
const updateSends = async (id:number, sends:number) => {
    try {
        db.query(
            "UPDATE files SET sent = $1 WHERE id = $2",
            [ sends+1, id]
        )
    } catch(e) {
        console.log(e);
    }
}

module.exports = {
    searchFiles: searchFiles,
    addFiles: addFiles,
    getFile: getFile,
    updateDownloads: updateDownloads,
    updateSends: updateSends
}