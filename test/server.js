import fs from 'fs'
import http from 'http'

const host = 'localhost'
const port = 8000

const dir = 'test/app/'

const server = http.createServer((req, res) => {
    if (req.url == '/') {
        res.writeHead(200, {'Content-Type': 'text/html'})

        // this should be done by a bundler but for now it works
        let script = fs.readFileSync('src/supercool.js', 'utf8') + '\n'
        fs.readdirSync(dir).forEach(file => {
            if (fs.statSync(dir + file).isFile() && file.endsWith('.js')) {
                script += fs.readFileSync(dir + file, 'utf8') + '\n'
            }
        })

        res.end(`<html><head><script>${script}</script></head><body></body></html>`)
    }
})

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`)
})