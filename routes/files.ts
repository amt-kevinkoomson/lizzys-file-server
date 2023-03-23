const expresser = require('express');
const fileRouter = expresser.Router();
const checkAuth = require('../middlewares/helpers').checkAuthenticated;

const search = require('../models/files').searchFiles;
const getFs = require('../models/database').getFiles;
const addFs = require('../models/files').addFiles;
const getF = require('../models/files').getFile;
const updateDown = require('../models/files').updateDownloads;
const updateSnds = require('../models/files').updateSends;
const transpor = require('../middlewares/nodemailer');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
})
const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand
} = require("@aws-sdk/client-s3");
const s3 = new S3Client({
    region: 'us-west-2'
});
//send email

fileRouter.post('/sendEmail/:id', checkAuth, async (req, res) => {
    const fileId = req.params.id;
    const recipientEmail = req.body.recipientEmail;
    const subject = req.body.subject;
    const message = req.body.message;
    const file = await getF(fileId);
    //getfile from bucket
    const input = {
        "Bucket": "lizzyserverphase3",
        "Key": file.filename
    }
    const command = new GetObjectCommand(input);
    await s3.send(command)
    .then(async (data) => {
        const mailOptions = {
            from: 'akme.africa15@gmail.com',
            to: recipientEmail,
            subject: subject,
            text: message,
            attachments: [{
                filename: file.filename,
                content: data.Body
            }]
        }
        await transpor.sendMail(mailOptions)
        .then( async () => {
            console.log('file sent');
            await updateSnds(fileId, file.sent)
            .then(()=>{ console.log('file records updated') });
            res.render('sendEmail', {
                name: req.user.name,
                isAdmin: req.user.admin_status,
                title: file.title,
                id: req.params.id,
                code: 200,
            });
        })
        .catch((e)=>{
            console.log(e);
            res.render('sendEmail', {
                name: req.user.name,
                isAdmin: req.user.admin_status,
                title: file.title,
                id: req.params.id,
                code: 400,
            });
        })

    })
    
})

fileRouter.get('/sendEmail/:fileId', checkAuth, async (req, res) => {
    const fileId = req.params.fileId;
    try {
        const file = await getF(fileId);
        res.render('sendEmail', {
            name: req.user.name,
            isAdmin: req.user.admin_status,
            title: file.title,
            id: fileId,
            code: null,
        });
    } catch (e) {
        console.log(e);
    }
})

//download file
fileRouter.get('/download/:fileId', checkAuth, async (req, res) => {
    const fileId = req.params.fileId;
    try {
        const file = await getF(fileId);
        const input = {
            "Bucket": "lizzyserverphase3",
            "Key": file.filename
        }
        const command = new GetObjectCommand(input);
        const data = await s3.send(command);
        console.log(data);
        await updateDown(fileId, file.downloads);
        res.setHeader('Content-disposition', `attachment; filename=${input.Key}`);
        res.setHeader('Content-type', data.ContentType);
        data.Body.pipe(res);

    } catch (e) {
        console.log(e);
    }
})

//upload file
fileRouter.post("/upload", checkAuth, upload.single('designFile'), async (req, res) => {
    const params = {
        "Bucket": "lizzyserverphase3", // The name of the bucket. For example, 'sample-bucket-101'.
        "Key": req.file.originalname, // The name of the object. For example, 'sample_upload.txt'.
        "Body": req.file.buffer, // The content of the object. For example, 'Hello world!".
    };
    await s3.send(new PutObjectCommand(params))
        .then(async (results) => {
            console.log(results);
            await addFs(req.user.id, req.body.titleText, req.body.description, req.file.originalname)
                .then(() => {
                    console.log('added to db');
                    res.render('upload', {
                        name: req.user.name,
                        isAdmin: req.user.admin_status,
                        code: 200,
                    });
                })
                .catch((e) => {
                    console.log(e);
                    res.render('upload', {
                        name: req.user.name,
                        isAdmin: req.user.admin_status,
                        code: 400,
                    });
                })
        })
        .catch((e) => {
            console.log(e);
            res.render('upload', {
                name: req.user.name,
                isAdmin: req.user.admin_status,
                code: 400,
            });
        })
})

fileRouter.get("/upload", checkAuth, (req, res) => {
    if (!req.user.admin_status) res.redirect('/dashboard')
    else res.render('upload', {
        name: req.user.name,
        code: null
    });
});

fileRouter.get('/search', checkAuth, async (req, res) => {
    const query = req.query.q;
    try {
        const files = await search(query);
        res.render('search-results', {
            name: req.user.name,
            isAdmin: req.user.admin_status,
            items: files,
        });

    } catch (e) {
        console.log(e);
        const files = await getFs();
        res.render('dashboard', {
            name: req.user.name,
            isAdmin: req.user.admin_status,
            items: files,
            number: files.length
        });
    }
})



module.exports = fileRouter;