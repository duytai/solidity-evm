import BN from 'bn.js'
import fetch from './opcodes'
import execute from './execute'

const whiteBuffer = size => {
  const d = []
  for (let i = 0; i < size; i++) d.push(0)
  return Buffer.from(d)
}
export default ({ code = '', callData = whiteBuffer(0), storage = {}}) => {
  const state = {
    programCounter: 0,
    code,
    stack: [],
    memory: [],
    callValue: new BN(0), // passing parameters
    callData,
    returnValue: false, // RETURN opCode
    stopped: false, // STOP opCode
    address: whiteBuffer(20), // Address of running user
    caller: new BN(0),
    origin: new BN(0),
    storage,
    accounts: {}
  }
  let isRunning = true
  while (isRunning) {
    const {
      programCounter,
      code,
     } = state
    const opCode = code[programCounter]
    state.programCounter ++
    console.log(`>> ${fetch(opCode).opName}`)
    execute(fetch(opCode), state)
    console.log(state.stack)
    console.log(state.storage)
    isRunning = state.programCounter < code.length
      && !state.returnValue.length
      && !state.stopped
  }
  return state
}
