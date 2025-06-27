import fs from 'fs'

export default class supercool {
    constructor(dir, renderingMethod) {
        this.dir = dir
        this.renderingMethod = renderingMethod
        this.reload()
    }

    reload() {
        let tags, state, router, body

        eval(fs.readFileSync('src/ssr.js', 'utf8'))

        if (this.renderingMethod === 'csr' || this.renderingMethod === 'hydration')
            this.script = fs.readFileSync('src/csr.js', 'utf8') + '\n'
        
        fs.readdirSync(this.dir).forEach(file => {
            if (fs.statSync(this.dir + file).isFile() && file.endsWith('.js')) {
                const content = fs.readFileSync(this.dir + file, 'utf8')

                if (this.renderingMethod === 'csr' || this.renderingMethod === 'hydration')
                    this.script += content + '\n'
                
                if (this.renderingMethod === 'ssr' || this.renderingMethod === 'hydration')
                    eval(content)
            }
        })
        
        if (this.renderingMethod === 'ssr' || this.renderingMethod === 'hydration')
            this.router = router
            this.body = body

        //if (this.renderingMethod === 'csr' || this.renderingMethod === 'hydration')
            // TODO run script through bundler/minifier
    }

    get(path, reload = false) {
        if (reload) reload()
        
        if (this.renderingMethod === 'csr') {
            return `<html><head><script>${this.script}</script></head><body></body></html>`
        } else if (this.renderingMethod === 'ssr') {
            this.router.goto(path)
            return `<html><head></head><body>${this.body}</body></html>`
        } else if (this.renderingMethod === 'hydration') {
            this.router.goto(path)
            return `<html><head><script>${this.script}</script></head><body>${this.body}</body></html>`
        }
    }

    handle(req, res) {
        res.writeHead(200, {'Content-Type': 'text/html'})
        res.end(this.get(req.url))
    }
}