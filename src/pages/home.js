import fs from "fs/promises"

import { stylesheet, el, load_snippet, load_sections } from "../utils.js"

async function html() {
    const title = "Felix";

    return (
        el('html',
            el('head',
                el("title", title), 
                el('meta name="viewport" content="width=device-width, initial-scale=1"'),
                stylesheet("res/index.css"),
                stylesheet("res/title.css"),
                '<link rel="preconnect" href="https://fonts.googleapis.com">',
                '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
                stylesheet("https://fonts.googleapis.com/css2?family=Open+Sans&display=swap"),
            ),
            el('body',
                el('div id="content"',
                    await load_snippet("./src/header.html"),
                    // el('body id="sections"',
                    //     await load_sections()
                    // )
                )
            )
        )
    )
}

export default async function() {
    fs.writeFile('index.html', '<!DOCTYPE html>' + await html());
}
