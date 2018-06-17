import abi from 'ethereumjs-abi'
import BN from 'bn.js'
import { randomAddress } from './src/lib'
import runCode from './src/runCode'
import data from './data'

const { code, callData } = data
const address = randomAddress()
const storage = {}
const accounts = {
  [address]: {
    code: '',
    balance: 0,
  }
}
// DEPLOY CONTRACT
const { returnValue } = runCode({
  code,
  storage,
  accounts,
  address: new BN(address, 'hex'),
  gasLeft: new BN(1000),
})
accounts[address].code = returnValue
// RUN METHOD
console.log('----METHOD----')
const d = runCode({
  code: accounts[address].code,
  storage,
  callData,
  accounts,
  address: new BN(address, 'hex'),
  gasLeft: new BN(1000),
})
console.log('->> ' + d.returnValue.toString('hex'))
