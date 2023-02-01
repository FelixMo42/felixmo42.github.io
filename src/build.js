const fs = require("fs/promises")

async function load_snippet(path) {
    return fs.readFile(path).then(value => 
        value
            .toString()
            .replaceAll('    ', '')
            .replaceAll('\t', '')
            .replaceAll('\n', '')
    )
}

async function load_sections() {
    const path = "./src/sections"

    const dir = await fs.readdir(path)

    const snippets = await Promise.all(dir.map((file_name) => load_snippet(`${path}/${file_name}`)))
    
    return snippets.join("")
}

async function main() {
    const title = "Felix";

    let text  = '<!DOCTYPE html>';
        text += '<html>'
        text +=     '<head>'
        text +=         `<title>${title}</title>`
        text +=         '<link rel="stylesheet" href="res/index.css">'
        text +=     '</head>'
        text +=     '<body>'
        text +=         '<div id="content">'
        text +=             await load_snippet("./src/header.html")
        text +=             await load_sections()
        text +=         '</div>'
        text +=     '</body>'
        text += '</html>'

    fs.writeFile('index.html', text);
}

main()