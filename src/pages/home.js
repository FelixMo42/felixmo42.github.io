import fs from "fs/promises"

import { page, load_snippet } from "../utils.js"

async function html() {
    return page("Felix", await load_snippet("./src/header.html"))
}

export default async function() {
    fs.writeFile('index.html', await html());
}
