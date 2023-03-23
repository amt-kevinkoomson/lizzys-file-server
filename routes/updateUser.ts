const exp = require('express');
const activateRouter = exp.Router();

const update = require('../models/database').updateUser;
const getU = require('../models/database').getUserByEmail;
const getUserByT = require('../models/database').getUserByToken;
const updateUserToke = require('../models/database').updateUserToken;
const updatePass = require('../models/database').updatePassword;

const bc = require('bcrypt');
const transpor = require('../middlewares/nodemailer');
const removeSla = require('../middlewares/helpers').removeSlash;

activateRouter.get('/activate/:hash', async (req, res) => {
    const hash = req.params.hash;
    console.log('active');
    try {
        if (hash) update(hash).then(() => {
            return res.render('index', {
                success: 'Account successfully updated. Please sign in'
            });
        })

    } catch (e) {
        console.log(e);
        res.render('confirm', {
            text: 'Something went wrong. Please try again or contact us'
        });
    }
})
activateRouter.get('/forgot', (req, res) => {
    res.render('forgot', {
        code: null
    });
});
activateRouter.post('/forgot', async (req, res) => {
    const email = req.body.resetEmail;
    try {
        const user = await getU(email);
        if (user.email === email) {
            bc.genSalt(10, (err2, salt) => {
                if (err2) console.log(err2)
                else {
                    bc.hash(email, salt, async (err3, hash) => {
                        if (err3) console.log(err3)
                        else {
                            const resetToken = removeSla(hash);
                            const expirationDate = new Date();
                            expirationDate.setHours(expirationDate.getHours() + 1);
                            const expirationString = expirationDate.toISOString();
                            await updateUserToke(resetToken, email, expirationString);
                            const mess = 'Please do not share the following link with anyone. This link expires after one hour. Please click the link to be redirected to a password reset page:' + '\n' + 'https://lizzys-designs.onrender.com/reset/' + resetToken;
                            const mailOptions = {
                                to: email,
                                subject: 'Password Reset at Lizzy\'s Designs',
                                text: mess
                            }
                            transpor.sendMail(mailOptions, (err, info) => {
                                if (err) console.log(err);
                                console.log(info);
                                res.render('reset-sent', {
                                    code: 200
                                });
                            })
                        }
                    })
                }
            })
        } else {
            res.render('confirm', {
                text: 'No user with that email. Please sign up or contact us!'
            });
        }
    } catch (e) {
        console.log('error thrown');
        console.log(e);
        res.render('reset-sent', {
            code: 400,
            async: true
        });
    }
});

activateRouter.get('/reset/:hash', async (req, res) => {
    const resetToken = req.params.hash;
    // console.log(resetToken);
    try {
        const user = await getUserByT(resetToken);
        if (!user) res.send('Invalid token');
        if (user && Date.now() <= user.expiration) {
            res.render('reset-form', {
                hash: resetToken
            });
        } else {
            res.send('Token expired');
        }
    } catch (e) {
        console.log(e);
        res.send('Something went wrong. Please try again or contact us');
    }
});

activateRouter.post('/reset/:hash', async (req, res) => {
    const hash = req.params.hash;
    const newPassword = req.body.password2;
    try {
        const user = await getUserByT(hash);
        if(!user) res.send('Invalid Token');
        else if(user && Date.now() >= user.expiration) res.send('The provided link expired');
        else if(user.reset_token === hash && Date.now() <= user.expiration) {
            const hashPass = await bc.hash(newPassword, 10);
            await updatePass(user.email, hashPass).then(() => {
                console.log('password reset');
                res.render('index', {
                    success: 'Your password has been reset successfully. Please sign in'
                })
            })
        }

    } catch(e) {
        console.log(e);
        res.send('Something went wrong. Please try again or contact us');
    }
})

module.exports = activateRouter;