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
            .map((file_name) => fs.readFile(`${path}/${file_name}`))
    )
    
    return snippets
        .map(f => f.toString())
        .sort((a, b) => a.includes("\n!pin") ? -1 : 1)
        .map(parse)
        .join("")
}

function get(lines, tag) {
    return lines.find(line => line.startsWith(`!${tag} `)).split(" ").slice(1).join(" ")
}

function parse(source) {
    let lines = source.split("\n")

    let title = get(lines, "title")
    let id = get(lines, "id")
    let created = get(lines, "created")

    return (
        el(`div class="section" id="${id}"`,
            el('div class="title"',
                el(`a href="#${id}"`, title),
                el('div', created),
            ),
            ...lines
                .filter(line => !line.startsWith("!"))
                .map(line =>
                        line == "" ? el('div class="br"') : 
                        line.startsWith("-") ? el('div class="bullet"', line) :
                            el("div", line)
                    )
        )
    )
}

function stylesheet(href) {
    return `<link rel="stylesheet" href="${href}">`
}

function el(tag, ...children) {
    return `<${tag}>${children.join("")}</${tag.split(" ")[0]}>`
}

async function html() {
    const title = "Felix";

    return (
        el('html',
            el('head',
                el("title", title), 
                stylesheet("res/index.css"),
                stylesheet("res/title.css"),
                '<link rel="preconnect" href="https://fonts.googleapis.com">',
                '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
                stylesheet("https://fonts.googleapis.com/css2?family=Open+Sans&display=swap"),
            ),
            el('body',
                el('div id="content"',
                    await load_snippet("./src/header.html"),
                    el('body id="sections"',
                        await load_sections()
                    )
                )
            )
        )
    )
}

async function main() {
    fs.writeFile('index.html', '<!DOCTYPE html>' + await html());
}

main()