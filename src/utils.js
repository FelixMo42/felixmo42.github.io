import fs from "fs/promises"

export function page(name, ...body) {
    return "<!DOCTYPE html>" + el('html',
        el('head',
            el("title", name), 
            el('meta name="viewport" content="width=device-width, initial-scale=1"'),
            stylesheet("/res/index.css"),
            '<link rel="preconnect" href="https://fonts.googleapis.com">',
            '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
            stylesheet("https://fonts.googleapis.com/css2?family=Open+Sans&display=swap"),
        ),
        el('body', el('div id="content"', ...body))
    )
}

export function stylesheet(href) {
    return `<link rel="stylesheet" href="${href}">`
}

export function el(tag, ...children) {
    return `<${tag}>${children.join("")}</${tag.split(" ")[0]}>`
}

export function parse(source) {
    let lines = source.split("\n")

    let title = get(lines, "title")
    let id = get(lines, "id")
    let created = get(lines, "created")
    let updated = get(lines, "updated")

    return (
        el(`div`,
            el('div class="title"',
                el(`a href="#${id}"`, title),
                el('div', updated ? `^${updated}` : created),
            ),
            ...lines
                .filter(line => !line.startsWith("!"))
                .filter((line, i) => !(line == "" && i == 0))
                .map(line =>
                        line == "" ? el('div class="br"') : 
                        line.startsWith("##") ? el('div class="h2"', line.substring(2)) :
                        line.startsWith("-") ? el('div class="bullet"', line) :
                        line.startsWith(" ") ? el('div class="tab"', line) :
                            el("div", line)
                    )
        )
    )
}

export async function load_snippet(path) {
    return fs.readFile(path).then(value => 
        value
            .toString()
            .replaceAll('\t', ' ')
            .replaceAll('\n', ' ')
            .replaceAll(/\s+/g, ' ')
    )
}

export async function load_sections() {
    const path = "./src/sections"

    const dir = await fs.readdir(path)

    const snippets = await Promise.all(
        dir
            .sort((a, b) => Number(b.split(".")[0]) - Number(a.split(".")[0]))
            .map((file_name) => fs.readFile(`${path}/${file_name}`))
    )
    
    return snippets
        .map(f => f.toString())
        .filter((f) => !f.includes("\n!hide"))
        .sort((a, b) => a.includes("\n!pin") ? -1 : 1)
        .map(parse)
        .join("")
}

function get(lines, tag) {
    let line = lines.find(line => line.startsWith(`!${tag} `));
    if (line != undefined) {
        return line.split(" ").slice(1).join(" ")
    } else {
        return undefined
    }
}
