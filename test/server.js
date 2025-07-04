import http from 'http'
import inject from '@rollup/plugin-inject'
import multi from '@rollup/plugin-multi-entry'
import path from 'path'
import terser from '@rollup/plugin-terser'
import { rollup } from 'rollup'

const APPDIR = 'app/'
const RENDERING_METHOD = 'hydration'
const HOST = 'localhost'
const PORT = 8000

async function render(dir, renderingMethod, req) {
    let csrOutput, ssrModule

    if (renderingMethod === 'csr' || renderingMethod === 'hydration') {
        const csrBundle = await rollup({
            input: path.join(dir, '**/*.js'),
            plugins: [
                multi(),
                inject({
                    router: ['../../src/csr.js', 'router'],
                    state: ['../../src/csr.js', 'state'],
                    tags: ['../../src/csr.js', 'tags']
                }),
                terser()
            ]
        })
        csrOutput = (await csrBundle.write({ file: 'build/csr.js' })).output[0].code
        csrBundle.close()
    }


    if (renderingMethod === 'ssr' || renderingMethod === 'hydration') {
        const ssrBundle = await rollup({
            input: path.join(dir, '**/*.js'),
            plugins: [
                multi(),
                inject({
                    router: ['../../src/ssr.js', 'router'],
                    state: ['../../src/ssr.js', 'state'],
                    tags: ['../../src/ssr.js', 'tags']
                }),
                terser()
            ]
        })
        await ssrBundle.write({
            file: 'build/ssr.js',
            footer: 'module.exports = router;'
        })
        ssrBundle.close()
        ssrModule = await import('./build/ssr.js')
    }
        
    if (renderingMethod === 'csr') {
        return `<html><head><script>${csrOutput}</script></head><body></body></html>`
    } else if (renderingMethod === 'ssr') {
        return `<html><head></head><body>${ssrModule.default.goto(req.url)}</body></html>`
    } else if (renderingMethod === 'hydration') {
        return `<html><head><script>${csrOutput}</script></head><body>${ssrModule.default.goto(req.url)}</body></html>`
    }
}

const server = http.createServer((req, res) => {
    render(APPDIR, RENDERING_METHOD, req).then(html => {
        res.writeHead(200, {'Content-Type': 'text/html'})
        res.end(html)
    })
})

server.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`)
})