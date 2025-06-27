import http from 'http'
import supercool from '../src/supercool.js'

const host = 'localhost'
const port = 8000

const app = new supercool('test/app/', 'hydration')

const server = http.createServer(app.handle.bind(app))

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`)
})