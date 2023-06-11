import fs from "fs"
import { exec } from "child_process"

function build() {
    exec('node src/build.js')
}

fs.watch('./src', build);
fs.watch('./src/pages', build);
fs.watch('./src/pages/nocturnal', build);
fs.watch('./src/sections', build);
