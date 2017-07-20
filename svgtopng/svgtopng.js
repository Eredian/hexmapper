const fs = require('pn/fs');
const svg2png = require('svg2png');

var argv = require('minimist')(process.argv.slice(2));

convert(argv._[0], argv._[1])

function convert(inputFolder, outputFolder) {

    fs.readdirSync(inputFolder).forEach(async fileName => {
        if (!fileName.endsWith('.svg')) {
            return
        }
        let file = await fs.readFile(inputFolder + '/' + fileName)
        let buffer = await svg2png(file, { width: 45, height: 45 })

        let outputFilename = outputFolder + '/' + fileName.replace('.svg', '.png')
        console.log(outputFilename)
        fs.writeFile(outputFilename, buffer)
    })
}