const Blockchain = require('./index')
const Block = require('./block')
const cryptoHash = require('../util/crypto-hash')


describe('blockchain', () => {
  let blockchain, newChain, originalChain
  beforeEach(() => {
    blockchain = new Blockchain()
    newChain = new Blockchain()
    originalChain = blockchain.chain

  })

  it('contains a chiain array instance', () => {
    expect(blockchain.chain instanceof Array).toBe(true)
  })

  it('starts with genesisblock', () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis())
  })

  it('add a new block to the chain', () => {
    const newData = 'foo bar'
    blockchain.addBlock({data: newData})
    expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData)
  })

  describe('isValidChain()', () => {
    describe('when chain dose not inlcude genesis block', () => {
      it('return false', () => {
        blockchain.chain[0] = {data: 'fake'}
        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
      })
    })
    describe('when the chain starts with the genesis and has multiple blocks', () => {
      beforeEach(() => {
        blockchain.addBlock({data: 'Bears'})
        blockchain.addBlock({data: 'beet'})
        blockchain.addBlock({data: 'hlelo'})
      })
      describe('and a lastHash reference has changed', () => {

        it('return false', () => {

          blockchain.chain[2].lastHash = 'fake-hash'
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
        })
      })
      describe('and the chain contains a block with an invalid field', () => {
        it('return false', () => {

          blockchain.chain[2].data= 'fake-hash'
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
        })
      })
      describe('and the chain does not contain any invalid blocks', () => {
        it('return true', () => {
          // blockchain.chain[1].lastHash = 'fake-hash'
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(true)
        })
      })
      describe('and the chain contains a block with a jump difficulty', () => {
        it('returns false', () => {
          const lastBlock = blockchain.chain[blockchain.chain.length - 1]
          const lastHash = lastBlock.hash
          const timestamp = Date.now()
          const nonce = 0
          const data = []
          const difficulty = lastBlock.difficulty - 3

          const hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty)
          const badBlock = new Block({timestamp, lastHash, hash, nonce, difficulty, data})
          blockchain.chain.push(badBlock)

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
        })
      })
    })
  })

  describe('replaceChain()', () => {
    let errorMock, logMock
    beforeEach(() => {
      errorMock = jest.fn()
      logMock = jest.fn()
      global.console.error = errorMock
      global.console.log = logMock
    })
    describe('when the new chain is not longer', () => {
      beforeEach(() => {
        newChain.chain[0] = {new: 'chain'}
        blockchain.replaceChain(newChain.chain)
      })
      it('does not replace the chain', () => {

        expect(blockchain.chain).toEqual(originalChain)
      })
      it('logs an error', () => {
        expect(errorMock).toHaveBeenCalled()
      })
    })

    describe('when the chain is longer', () => {
      beforeEach(() => {
        newChain.addBlock({data: 'bears'})
        newChain.addBlock({data: 'beetss'})
        newChain.addBlock({data: 'bela'})
      })
      describe('and the chain is invalide', () => {
        it('does not replace the chain', () => {
          newChain.chain[2].hash = 'some-fake-hash'
          blockchain.replaceChain(newChain.chain)
          expect(blockchain.chain).toEqual(originalChain)
        })
      })
      describe('and the chain is valid', () => {
        it('replaces the chain', () => {
          blockchain.replaceChain(newChain.chain)
          expect(blockchain.chain).toEqual(newChain.chain)
        })
      })
    })
  })
})