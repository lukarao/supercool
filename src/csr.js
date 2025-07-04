export const listeners = {}

export const tags = new Proxy({}, {
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

export const state = new Proxy({}, {
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

export const router = {
    routes: {},
    route(path, handler) {
        this.routes[path] = handler
    },
    goto(url) {
        const parsedURL = new URL(url.replace(/\/+$/, ''), window.location.origin)
        const path = parsedURL.pathname
        if (path in this.routes) {
             // TODO: use an update dom function to diff check
            document.body.replaceChildren(this.routes[path]())
        } else {
            // TODO: add error page
            document.body.innerHTML = '404'
            console.error('unable to find route', path)
        }
    }
}

navigation.addEventListener('navigate', (e) => {
    e.intercept({
        handler() {
            router.goto(e.destination.url)
        }
    })
})

document.addEventListener('DOMContentLoaded', (e) => {
    router.goto(window.location.href)
})