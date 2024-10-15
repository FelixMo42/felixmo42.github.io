import { CONFIG } from "../config.ts";
import { md_to_html } from "./markdown.ts";
import { async_map } from "./utils.ts";
import { ENCODER } from "./utils.ts";
import { DECODER, is_hidden } from "./utils.ts";

export class Vault {
    $path: string;

    $files: Map<string, string> = new Map()
    $visible: Map<string, boolean> = new Map()

    constructor(path: string = CONFIG.NOTES_SRC_DIR) {
        this.$path = path
    }

    async load(path = this.$path) {
        for await (const file of Deno.readDir(path)) {
            // skip hidden files
            if (is_hidden(file)) continue
    
            // recersue on folders
            if (file.isDirectory) {
                await this.load(path + file.name + "/")
            }
            
            // add files to our list
            if (file.isFile) {
                const title = file.name
                    .replace(/\..*/, "")
                    .replace(";", ":")
    
                await this.add_file(title, path + file.name)
            }
        }
    
        return this
    }

    async add_file(title: string, path: string) {
        // make sure the file is not empty
        const data = await Deno.readFile(path)
        if (data.length === 0) return

        // otherwise were go to go
        this.$files.set(title, path)
    }

    has_file(title: string) {
        return this.$files.has(title)
    }

    files() {
        return this.$files.entries()
    }

    build(title: string) {
        // It is already visible, our work is done here
        if (this.is_visible(title)) return
        this.$visible.set(title, true)

        return build(this, title)
    }

    async link(title: string, label: string = title) {
        if (this.has_file(title)) {
            await this.build(title)
            const href = format_file_name(title)
            return `<a href="./${href}.html">${label}</a>`
        }

        return label
    }

    is_visible(title: string) {
        return this.$visible.get(title) ?? false
    }

    async build_index(vault: Vault) {
        // load the notes
        const notes = await async_map(vault.$visible.keys(),
            async (title) => `<p>${await vault.link(title)}</p>`)
    
        // Make the index html
        const html = [
            "<!DOCTYPE html>",
            "<html>",
                "<head>",
                    `<title>Notes</title>`,
                    `<link rel="stylesheet" href="/res/main.css">`,
                "</head>",
                "<body>",
                    "<main>",
                        "<h1>Felix's evergreen notes</h1>",
                        notes.join("\n"),
                    "</main>",
                "</body>",
            "</html>",
        ].join("")
    
        // write the file to the pub dir
        await Deno.writeFile(
            CONFIG.NOTES_PUB_DIR + `index.html`,
            ENCODER.encode(html)
        )
    }    
}


async function build(vault: Vault, title: string) {
    const name = format_file_name(title)
    
    // read the file
    const data = await Deno.readFile(vault.$files.get(title)!)
    const text = DECODER.decode(data)

    // turn it into html
    const html = [
        "<!DOCTYPE html>",
        "<html>",
            "<head>",
                `<title>${title}</title>`,
                `<link rel="stylesheet" href="/res/main.css">`,
            "</head>",
            "<body>",
                "<main>",
                    await md_to_html(`# ${title}\n${text}`, vault),
                "</main>",
            "</body>",
        "</html>",
    ].join("")

    // write the file to the pub dir
    await Deno.writeFile(
        CONFIG.NOTES_PUB_DIR + `${name}.html`,
        ENCODER.encode(html)
    )
}

function format_file_name(title: string) {
    return title
        .toLowerCase()
        .replaceAll(/[^a-zA-Z0-9\s]/g, "")
        .replaceAll(/\s/g, "_")
}
