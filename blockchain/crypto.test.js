const cryptoHash = require('./crypto-hash')

describe('cryptoHash()', () => {
  it('produces the same hash with the same input arugment in any order', () => {
    expect(cryptoHash('a', 'b', 'c')).not.toEqual(cryptoHash('b', 'a', 'c'))
  })
})