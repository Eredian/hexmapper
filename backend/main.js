var express = require('express');
var bodyParser = require('body-parser');
var Datastore = require('nedb-promise');
var config = require('./config.js')
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var passport = require('passport')
var jwt = require('jsonwebtoken');
var sleep = require('system-sleep');

sleep(8000); // The best fix I got right now for an issue with windows 10 not releasing files.
var db = new Datastore({ filename: './datafile', autoload: true });

passport.use(new GoogleStrategy({
    clientID: config.oauth.clientId,
    clientSecret: config.oauth.clientSecret,
    callbackURL: config.oauth.redirectUri
},
    function (accessToken, refreshToken, profile, cb) {
        cb(null, profile);
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.use(passport.initialize());

app.get('/auth/authorize', function (req, res, next) {
    passport.authenticate('google', {
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ],
        state: req.query.redirect
    })(req, res, next)
});

app.get('/auth/oauthcallback', function (req, res, next) {
    passport.authenticate('google', { failureRedirect: '/auth/failure' }, function (err, user, info) {
        if (err) {
            console.log(err)
            res.sendStatus(500)
        } else if (!user) {
            return res.status(401).json({ status: 'error', code: 'unauthorized' });
        } else {
            var token = jwt.sign({ data: user.emails[0].value }, config.jwt.secret, {
                expiresIn: "1d"
            })
            var messageUri = req.query.state
            var message = JSON.stringify({ token: token, name: user.displayName, email: user.emails[0].value, photo: user.photos[0].value })
            res.send(`<script type="text/javascript">window.opener.postMessage(\`${message}\`, "${messageUri})");` +
                `window.close()</script>`)
        }
    })(req, res, next)
})

app.use(function (req, res, next) {
    if (req.method == "OPTIONS") {
        return next()
    }
    if (req.headers.authorization) {
        var auth = req.headers.authorization;
        if (auth && auth.startsWith("Bearer ")) {
            var token = auth.slice(7)
            var decodedToken = jwt.verify(token, config.jwt.secret)
            req.user = decodedToken.data
        }
    }
    if (true || req.user) { //bypassed
        return next();
    } else {
        //return res.status(401).json({ status: 'error', code: 'unauthorized' });
    }
});

app.get('/map', async (req, res) => {
    let documentList = await db.find({ "tiles.permissions.users": { $in: [req.user, '*'] } }, { name: 1 }).catch(e => res.status(500).json({ message: e.message }));

    if (documentList) {
        documentList = documentList.map(elem => elem._id);
        res.send(documentList);
    }
});

app.get('/map/:id', async (req, res) => {
    let id = req.params.id;
    let document = await db.findOne({ "_id": id, "tiles.permissions.users": { $in: [req.user, '*'] } }).catch(e => res.status(500).json({ message: e.message }));

    if (!document) {
        res.status(404).send("Map not found.");
    } else {
        res.send(document);
    }
});

app.post('/map/:id', async (req, res) => {
    let id = req.params.id;
    let body = req.body;

    try {
        var updateResult = await db.update({ _id: id }, { _id: id, tiles: body }, { upsert: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
    if (updateResult[2] === true) {
        res.sendStatus(201);
    } else {
        res.sendStatus(200);
    }
});

app.listen(8081, function () {
    console.log('App is started.');
});