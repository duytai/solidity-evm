import abi from 'ethereumjs-abi'
import BN from 'bn.js'
import { randomAddress } from './src/lib'
import runCode from './src/runCode'
import data from './data'

const { code, callData } = data
const address = randomAddress()
const accounts = {
  [address]: {
    code,
    balance: 0,
    storage: {},
  }
}
// DEPLOY CONTRACT
const { returnValue } = runCode({
  accounts,
  code: accounts[address].code,
  storage: accounts[address].storage,
  address: new BN(address, 'hex'),
  gasLeft: new BN(1000),
  caller: new BN(address, 'hex'),
})
accounts[address].code = returnValue
console.log(returnValue.toString('hex'))
// RUN METHOD
console.log('----METHOD----')
const d = runCode({
  code: accounts[address].code,
  storage: accounts[address].storage,
  callData,
  accounts,
  address: new BN(address, 'hex'),
  gasLeft: new BN(1000),
  caller: new BN(address, 'hex'), // caller who calls this method
  origin: new BN(address, 'hex'), // origin who create contract
})
console.log('->> ' + d.returnValue.toString('hex'))
