import express from 'express';
import Account from '../models/account';

const router = express.Router();

router.post('/signup', (req, res) => {
    let usernameRegex = /^[a-zA-Z0-9]+$/;
    if(!usernameRegex.test(req.body.username)) {
        return res.status(400).json({
            error : "BAD USERNAME",
            code : 1
        });
    }
    if(req.body.password.length < 4 || typeof req.body.password !== "string"){
        return res.status(400).json({
            error : "BAD USERNAME",
            code : 2
        });
    }

    Account.findOne({ username: req.body.username }, (err, exists) => {
        if (err) throw err;
        if(exists){
            return res.status(409).json({
                error: "USERNAME EXISTS",
                code: 3
            });
        }

        // CREATE ACCOUNT
        let account = new Account({
            username: req.body.username,
            password: req.body.password
        });

        account.password = account.generateHash(account.password);

        // SAVE IN THE DATABASE
        account.save( err => {
            if(err) throw err;
            return res.json({ success: true });
        });

    });
});

router.post('/signin', (req, res) => {
    if(typeof req.body.password !== "string"){
        return res.status(401).json({
            error : "LOGIN FAILED",
            code : 1
        });
    }
    Account.findOne({ username: req.body.username}, (err, account) => {
        if(err) throw err;

        // CHECK ACCOUNT EXISTANCY
        if(!account) {
            return res.status(401).json({
                error: "LOGIN FAILED",
                code: 1
            });
        }

        // CHECK WHETHER THE PASSWORD IS VALID
        if(!account.validateHash(req.body.password)) {
            return res.status(401).json({
                error: "LOGIN FAILED",
                code: 1
            });
        }

        // ALTER SESSION
        let session = req.session;
        session.loginInfo = {
            _id: account._id,
            username: account.username
        };

        // RETURN SUCCESS
        return res.json({
            success: true
        });
    });
});

router.get('/getinfo', (req, res) => {
    if(typeof req.session.longinInfo === "undefined"){
        return res.status(401).json({
            error : 1
        });
    }
    res.json({ info : req.session.longinInfo });
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {if(err) throw err; });
    return res.json({ success : true });
});

export default router;
