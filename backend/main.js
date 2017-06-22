var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config.js')
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var passport = require('passport')
var jwt = require('jsonwebtoken');
var mysql = require('mysql2/promise');
var errorHandler = require('errorhandler')

let wrap = fn => (...args) => fn(...args).catch(args[2])

var connection = mysql.createPool({
    connectionLimit: 10,
    host: config.mysql.url,
    user: config.mysql.username,
    password: config.mysql.password,
    database: config.mysql.database
});

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

app.use(errorHandler());
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
            try {
                var decodedToken = jwt.verify(token, config.jwt.secret)
                req.user = decodedToken.data
            } catch (error) {
                console.log(error) //TODO invalid token
            }
        }
    }
    return next();
    //return res.status(401).json({ status: 'error', code: 'unauthorized' });
});

app.get('/map', wrap(async (req, res) => {
    let rows
    if (req.user) {
        [rows] = await connection.query("SELECT DISTINCT mapName from permission WHERE email IN(?, '*')", req.user);
    } else {
        [rows] = await connection.query("SELECT DISTINCT mapName from permission WHERE email IN('*')");
    }
    if (rows) {
        res.send(rows.map(elem => elem.mapName));
    }
}));

app.get('/map/:id', wrap(async (req, res) => {
    let id = req.params.id;
    const [permissions] = await connection.query("SELECT * FROM permission WHERE mapName = ?", id);
    if (permissions.length == 0) {
        res.status(404).send("Map not found.");
        return;
    }
    if (!permissions.some(permission => { return permission.email == "*" || permission.email == req.user })) {
        res.status(404).send("Map not found.");
        return;
    }
    const [tiles] = await connection.query("SELECT * FROM tile WHERE mapName = ?", id);
    const [tileColors] = await connection.query("SELECT * FROM tileColor WHERE mapName = ?", id);

    res.send({ mapName: id, tiles: tiles, permissions: permissions, tileColors: tileColors });
}));

app.post('/map/:id', wrap(async (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let updating = false;

    try {
        await connection.query('INSERT INTO map SET ?', { name: id })
    } catch (e) {
        if (e.code == "ER_DUP_ENTRY") {
            await connection.query('DELETE FROM map WHERE name = ?', id)
            await connection.query('INSERT INTO map SET ?', { name: id })
            updating = true;
        } else {
            throw e
        }
    }

    let tileArray = []
    body.tiles.forEach((tile) => { tileArray.push([tile.x, tile.y, id, JSON.stringify(tile.drawingData), JSON.stringify(tile.extraData)]) })
    await connection.query('INSERT INTO tile (`x`, `y`, `mapName`, `drawingData`, `extraData`) VALUES ?', [tileArray]);

    let permissionArray = []
    body.permissions.forEach((permission) => { permissionArray.push([permission.email, permission.type, id]) })
    await connection.query('INSERT INTO permission (`email`, `type`, `mapName`) VALUES ?', [permissionArray])

    let tileColorArray = []
    body.tileColors.forEach((tileColor) => { tileColorArray.push([tileColor.id, id, tileColor.name, tileColor.R, tileColor.G, tileColor.B]) })
    await connection.query('INSERT INTO tileColor (`id`, `mapName`, `name`, `R`, `G`, `B`) VALUES ?', [tileColorArray])

    if (updating) {
        res.sendStatus(201);
    } else {
        res.sendStatus(200);
    }
}));

app.listen(config.listeningPort, config.listeningDomain, function () {
    console.log('App is started.');
});