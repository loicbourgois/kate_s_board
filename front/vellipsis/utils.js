const get_elapsed_formatted = (start) => {
    return String( performance.now() - start ).padStart(3, ' ') + " ms"
}
export {
    get_elapsed_formatted,
}
