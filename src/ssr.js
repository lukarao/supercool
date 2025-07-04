import { URL } from 'url'

export const tags = new Proxy({}, {
    get(_, name) {
        return (...args) => {
            const argsList = [...args]
            if (name === 'listener') {
                return argsList[1]()
            } else {
                if (argsList[0] instanceof Object) {
                    // TODO add support for attributes
                    argsList.shift()
                    return `<${name}>${argsList.join('')}</${name}>`
                } else {
                    return `<${name}>${argsList.join('')}</${name}>`
                }
            }
        }
    }
})

export const state = {}

export const router = {
    routes: {},
    route(path, handler) {
        this.routes[path] = handler
    },
    goto(url) {
        const parsedURL = new URL(url.replace(/\/+$/, ''))
        const path = parsedURL.pathname
        if (path in this.routes) {
            return this.routes[path]()
        } else {
            // TODO: add error page
            console.error('unable to find route', path)
            return '404'
        }
    }
}