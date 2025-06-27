import fs from 'fs'

export default class supercool {
    constructor(dir, renderingMethod) {
        this.dir = dir
        this.renderingMethod = renderingMethod
    }

    get(path) {
        let tags, state, router, body

        eval(fs.readFileSync('src/ssr.js', 'utf8')
            .replace('const tags', 'tags')
            .replace('const state', 'state')
            .replace('const router', 'router')
        )

        let script
        if (this.renderingMethod === 'csr' || this.renderingMethod === 'hydration')
            script = fs.readFileSync('src/csr.js', 'utf8') + '\n'
        
        fs.readdirSync(this.dir).forEach(file => {
            if (fs.statSync(this.dir + file).isFile() && file.endsWith('.js')) {
                const content = fs.readFileSync(this.dir + file, 'utf8')

                if (this.renderingMethod === 'csr' || this.renderingMethod === 'hydration')
                    script += content + '\n'
                
                if (this.renderingMethod === 'ssr' || this.renderingMethod === 'hydration')
                    eval(content)
            }
        })
        
        if (this.renderingMethod === 'ssr' || this.renderingMethod === 'hydration')
            router.goto(path)

        //if (this.renderingMethod === 'csr' || this.renderingMethod === 'hydration')
            // TODO run script through bundler/minifier

        if (this.renderingMethod === 'csr')
            return `<html><head><script>${script}</script></head><body></body></html>`
        else if (this.renderingMethod === 'ssr')
            return `<html><head></head><body>${body}</body></html>`
        else if (this.renderingMethod === 'hydration')
            return `<html><head><script>${script}</script></head><body>${body}</body></html>`
    }

    handle(req, res) {
        res.writeHead(200, {'Content-Type': 'text/html'})
        res.end(this.get(req.url))
    }
}