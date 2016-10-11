var fs = require("fs");

var imageNames = JSON.stringify(fs.readdirSync(__dirname + "/../img/images"));

fs.writeFile(__dirname + "/../img/images/list.json", imageNames);