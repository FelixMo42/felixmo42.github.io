const fs = require("fs")
const { exec } = require("child_process");

function build() {
    exec('node src/build.js')
}

fs.watch('./src', build);
fs.watch('./src/sections', build);
