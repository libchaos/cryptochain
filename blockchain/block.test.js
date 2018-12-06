const Block = require('./block')
const {GENESIS_DATA, MINE_RATE} = require('../config')
const cryptoHash = require('../util/crypto-hash')
const hexToBinary = require('hex-to-binary')

describe('Block', () => {
  const timestamp = 2000
  const lastHash = 'foo-hash'
  const hash = 'bar-hash'
  const data = ['blockchain', 'data']
  const nonce = 1
  const difficulty = 1
  const block = new Block({
    timestamp,
    lastHash,
    hash,
    data,
    nonce,
    difficulty
  })
  it('has a timestamp hash lashHash and data property', () => {
    expect(block.timestamp).toEqual(timestamp)
    expect(block.hash).toEqual(hash)
    expect(block.lastHash).toEqual(lastHash)
    expect(block.data).toEqual(data)
    expect(block.nonce).toEqual(nonce)
    expect(block.difficulty).toEqual(difficulty)
  })

  describe('genesis()', () => {
    const genesisBlock = Block.genesis()

    it('return a block instance', () => {
      expect(genesisBlock instanceof Block).toEqual(true)
    })

    it('return the genesis data', () => {
      expect(genesisBlock).toEqual(GENESIS_DATA)
    })
  })

  describe('mineBlock()', () => {
    const lastBlock = Block.genesis();
    const data = 'mine data'
    const mineBlock = Block.mineBlock({lastBlock, data})

    it('return a block instance', () => {
      expect(mineBlock instanceof Block).toBe(true)
    })
    it('sets the lastHash to be the hash of lastBlock', () => {
      expect(mineBlock.lastHash).toEqual(lastBlock.hash)
    })
    it('create a sha-256 base inputs', () => {
      expect(mineBlock.hash)
        .toEqual(
          cryptoHash(
            mineBlock.timestamp,
            lastBlock.hash,
            data,
            mineBlock.nonce,
            mineBlock.difficulty,
          )
        )
    })
    it('set a hash that matches the diffuculty criteria', () => {
      expect(hexToBinary(mineBlock.hash).substring(0, mineBlock.difficulty)).toEqual('0'.repeat(mineBlock.difficulty))
    })
    it('adjust the difficulty', () => {
      const possibleResults = [lastBlock.difficulty + 1, lastBlock.difficulty - 1]
      expect(possibleResults.includes(mineBlock.difficulty))
    })
  })

  describe('adjustDifficulty()', () => {
    it('raises the difficulty for a quickly mined block', () => {
      expect(Block.adjustDifficulty({
        originalBlock: block,
        timestamp: block.timestamp + MINE_RATE - 100})).toEqual(block.difficulty + 1)
    })
    it('lowers the difficulty for a slowly mined block', () => {

      expect(Block.adjustDifficulty({
        originalBlock: block,
        timestamp: block.timestamp + MINE_RATE + 100
      })).toEqual(block.difficulty - 1)
    })
  })
})