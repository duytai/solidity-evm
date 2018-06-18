import createKeccakHash from 'keccak'
import BN from 'bn.js'
import randomAddress from './randomAddress'

const keccak = buf => createKeccakHash('keccak256').update(buf).digest()
const blocks = [...Array(300).keys()].map(i => ({
  header: {
    coinbase: new BN(randomAddress(), 'hex'),
    timestamp: new BN(Date.now()),
    number: new BN(i),
    difficulty: new BN(1024),
    gasLimit: new BN('ffffffff', 'hex'),
  },
  hash: () => {
    const hex = Number(i).toString(16)
    const buffer = Buffer.from(hex, 'hex')
    return keccak(buffer)
  }
}))

export default {
  getBlock: (blockNumber) => blocks[blockNumber],
}
