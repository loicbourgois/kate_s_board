const get_elapsed_formatted = (start) => {
    return String( performance.now() - start ).padStart(3, ' ') + " ms"
}
const set_html = (id, value) => {
    document.getElementById(id).innerHTML = value
}
export {
    get_elapsed_formatted,
    set_html,
}
