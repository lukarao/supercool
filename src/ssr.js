const tags = new Proxy({}, {
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

const state = {}

const router = {
    routes: {},
    route(path, handler) {
        this.routes[path] = handler
    },
    goto(path) {
        const normalPath = path === '/' ? '/' : path.replace(/\/+$/, '')
        if (normalPath in this.routes) {
             // TODO: use an update dom function to diff check
            body = this.routes[normalPath]()
        } else {
            // TODO: add error page
            body = '404'
            console.error('unable to find route', normalPath)
        }
    }
}