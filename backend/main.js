var express = require('express');
var bodyParser = require('body-parser');
var Datastore = require('nedb-promise');

var app = express();
app.use(bodyParser.json({ limit: '50mb' })); // for parsing application/json
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var db = new Datastore({ filename: './datafile', autoload: true });

app.get('/', async (req, res) => {
    let id = req.params.id;
    let documentList = await db.find({}, { name: 1 }).catch(e => res.status(500).json({ message: e.message }));

    if (documentList) {
        documentList = documentList.map(elem => elem._id);
        res.send(documentList);
    }
});

app.get('/:id', async (req, res) => {
    let id = req.params.id;
    let document = await db.findOne({ "_id": id }).catch(e => res.status(500).json({ message: e.message }));

    if (!document) {
        res.status(404).send("Map not found.");
    } else {
        res.send(document);
    }
});

app.post('/:id', async (req, res) => {
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