import fs from "fs/promises"

import { el, page, parse } from "../utils.js"

async function get_posts() {
    let dir = "./src/pages/nocturnal/"

    const files = await fs.readdir(dir)
    const posts = await Promise.all(files.map(async file => ({
        name: file,
        text: await fs.readFile(`${dir}${file}`).then(buf => buf.toString())
    })))

    return posts.reverse()
}

function get_date_from_post(post) {
    return post.text.split("\n")[0].substring(2)
}

function get_number_from_post(post) {
    return post.name.replace(".md", "")    
}

function build_post_body(post) {
    let [date, ...rest] = post.text.split("\n")
    return page(
        get_date_from_post(post),
        el("div",
            el("div class='h2'", `NM Newsletter #${get_number_from_post(post)} - ${get_date_from_post(post)}`),
            parse(rest.join("\n"))
        )
    ) 
}

async function html() {
    const posts = await get_posts()

    // make sure the folder exist
    await fs.mkdir("./nocturnal", {recursive: true }).catch(() => {})

    // write out each post
    posts.forEach(post => 
        fs.writeFile(
            `./nocturnal/${get_number_from_post(post)}.html`, build_post_body(post)
        )
    )

    return page('Nocturnal',
        el("h3", "Night Market News Letters"),
        ...posts.map(post => el(`a href="./nocturnal/${get_number_from_post(post)}.html"`,
            `Issue #${get_number_from_post(post)} - ${get_date_from_post(post)}`,
        )).join("<br>")
    )
}



export default async function() {
    fs.writeFile('nocturnal.html', '<!DOCTYPE html>' + await html());
}
