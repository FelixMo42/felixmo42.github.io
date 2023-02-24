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

    const snippets = await Promise.all(
        dir
            .sort((a, b) => Number(b.split(".")[0]) - Number(a.split(".")[0]))
            .map((file_name) => load_snippet(`${path}/${file_name}`))
    )
    
    return snippets.join("")
}

function stylesheet(href) {
    return `<link rel="stylesheet" href="${href}">`
}

async function main() {
    const title = "Felix";

    let text  = '<!DOCTYPE html>';
        text += '<html>'
        text +=     '<head>'
        text +=         `<title>${title}</title>`
        text +=         stylesheet("res/index.css")
        text +=         stylesheet("res/title.css")
        text +=         '<link rel="preconnect" href="https://fonts.googleapis.com">'
        text +=         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
        text +=         stylesheet("https://fonts.googleapis.com/css2?family=Open+Sans&display=swap")
        text +=     '</head>'
        text +=     '<body>'
        text +=         '<div id="content">'
        text +=             await load_snippet("./src/header.html")
        text +=             '<div id="sections">'
        text +=                 await load_sections()
        text +=             '</div>'
        text +=         '</div>'
        text +=     '</body>'
        text += '</html>'

    fs.writeFile('index.html', text);
}

main()