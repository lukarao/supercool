import express from 'express'
import inject from '@rollup/plugin-inject'
import multi from '@rollup/plugin-multi-entry'
import path from 'path'
import terser from '@rollup/plugin-terser'
import { rollup } from 'rollup'

const APPDIR = 'app/'
const RENDERING_METHOD = 'hydration'
const PORT = 8000

const app = express()

async function render(req) {
    let csrOutput, ssrModule

    if (RENDERING_METHOD === 'csr' || RENDERING_METHOD === 'hydration') {
        const csrBundle = await rollup({
            input: path.join(APPDIR, '**/*.js'),
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

    if (RENDERING_METHOD === 'ssr' || RENDERING_METHOD === 'hydration') {
        const ssrBundle = await rollup({
            input: path.join(APPDIR, '**/*.js'),
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
            outro: 'export default router;'
        })
        ssrBundle.close()
        ssrModule = await import('./build/ssr.js')
    }

    const url = `http://localhost${req.url}`
        
    if (RENDERING_METHOD === 'csr') {
        return `<html><head><script>${csrOutput}</script></head><body></body></html>`
    } else if (RENDERING_METHOD === 'ssr') {
        return `<html><head></head><body>${ssrModule.default.goto(url)}</body></html>`
    } else if (RENDERING_METHOD === 'hydration') {
        return `<html><head><script>${csrOutput}</script></head><body>${ssrModule.default.goto(url)}</body></html>`
    }
}

app.use('*all', async (req, res) => {
    render(req).then(html => {
        res.status(200).set({'Content-Type': 'text/html'}).send(html)
    })
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})