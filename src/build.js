import home_page from "./pages/home.js"
import nocturnal_page from "./pages/nocturnal.js"

const pages = [
    home_page,
    nocturnal_page,
]

pages.forEach(page => page())