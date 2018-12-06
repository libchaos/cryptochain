const express = require('express')
const bodyParser = require('body-parser')
const Blockchain = require('./blockchain/blockchain')

const app = express()
const blockchain = new Blockchain()
app.use(bodyParser.json())
app.get('/api/blocks', (req, res) => {
  res.json(blockchain.chain)
})

app.post('/api/mine', (req, res) => {
  const { data } = req.body
  blockchain.addBlock({ data })
  res.redirect('/api/blocks')
})

const PORT = 3000
app.listen(3000, (err) => {
  if (err) console.error(err)
  console.log('listening at localhost: ', PORT)
})