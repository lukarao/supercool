const listeners = {}

const tags = new Proxy({}, {
    get(_, name) {
        return (...args) => {
            const argsList = [...args]
            if (name === 'listener') {
                const el = argsList[1]()
                argsList[0].forEach(stateVar => {
                    if (listeners[stateVar]) {
                        listeners[stateVar].push([el, argsList[1]])
                    } else {
                        listeners[stateVar] = [[el, argsList[1]]]
                    }
                })
                return el
            } else {
                const el = document.createElement(name)
                if (argsList[0] instanceof Object && !(argsList[0] instanceof Node)) {
                    for (const attr in argsList[0]) {
                        el.setAttribute(attr, argsList[0][attr])
                    }
                    argsList.shift()
                }
                el.append(...argsList)
                return el
            }
        }
    }
})

const state = new Proxy({}, {
    get(target, prop) {
        return target[prop]
    },
    set(target, prop, value) {
        target[prop] = value
        if (listeners[prop]) {
            listeners[prop].forEach((entry, i) => {
                const el = entry[1]()
                entry[0].replaceWith(el)
                listeners[prop][i] = [el, entry[1]]
            })
        }
        return true
    }
})

const router = {
    routes: {},
    route(path, handler, _default = false) {
        this.routes[path] = handler
        if (_default) {
            this.default = path
        }
    },
    goto(path) {
        const normalPath = path === '/' ? '/' : path.replace(/\/+$/, '')
        if (normalPath in this.routes) {
             // TODO: use an update dom function to diff check
            document.body.replaceChildren(this.routes[normalPath]())
        } else {
            // TODO: add error page
            document.body.innerHTML = '404'
            console.error('unable to find route', normalPath)
        }
    }
}

navigation.addEventListener('navigate', (e) => {
    e.intercept({
        handler() {
            router.goto(e.destination.url.replace(window.location.origin, ''))
        }
    })
})

document.addEventListener("DOMContentLoaded", (e) => {
    router.goto(router.default)
})