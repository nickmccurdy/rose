import nodeFetch from 'node-fetch'
import app from '../server'

describe('server', () => {
  function fetch (path, init) {
    return nodeFetch(`http://localhost:3000${path}`, init)
  }

  let server

  beforeAll(done => {
    server = app.listen(3000, done)
  })

  afterAll(done => {
    server.close(done)
  })

  describe('GET /', () => {
    it('responds with success', () => {
      return expect(fetch('/')).resolves.toHaveProperty('status', 200)
    })
  })

  describe('GET /index.json', () => {
    it('responds with features', () => {
      return fetch('/index.json', {
        headers: { 'Content-Type': /json/ }
      }).then(response => {
        expect(response.status).toBe(200)
        return expect(response.json()).resolves.not.toHaveLength(0)
      })
    })
  })

  describe('GET /404', () => {
    it('responds with a 404 error', () => {
      return expect(fetch('/404')).resolves.toHaveProperty('status', 404)
    })
  })
})
