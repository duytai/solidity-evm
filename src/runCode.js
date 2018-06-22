import BN from 'bn.js'
import { fakeBlockChain } from './lib'
import fetch from './opcodes'
import execute from './execute'

const runCode = ({
  code = '',
  callData = new BN(0),
  storage = {},
  accounts = {},
  address = new BN(0),
  gasLeft = new BN(0),
  caller = new BN(0),
  origin = new BN(0),
  callValue = new BN(0),
  lastReturned = Buffer.from([]),
  block = fakeBlockChain.getBlock(299),
  logOptions = [],
  logs = [],
}) => {
  const state = {
    programCounter: 0,
    code,
    stack: [],
    memory: [],
    callValue, // passing parameters
    callData,
    returnValue: false, // RETURN opCode
    stopped: false, // STOP opCode
    address,
    caller,
    origin,
    storage,
    accounts,
    gasLeft,
    runCode,
    lastReturned,
    block,
    logs,
  }
  let isRunning = true
  while (isRunning) {
    const {
      programCounter,
      code,
     } = state
    const opCode = code[programCounter]
    logOptions.includes('OPCODE') && console.log(`>> 0x${state.programCounter.toString(16)} ${fetch(opCode).opName}`)
    state.programCounter ++
    execute(fetch(opCode), state)
    logOptions.includes('STACK') && console.log(state.stack)
    console.log(opCode)
    isRunning = state.programCounter < code.length
      && !state.returnValue.length
      && !state.stopped
  }
  return state
}
export default runCode
