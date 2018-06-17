import BN from 'bn.js'
import fetch from './opcodes'
import execute from './execute'

const whiteBuffer = size => {
  const d = []
  for (let i = 0; i < size; i++) d.push(0)
  return Buffer.from(d)
}
const runCode = ({
  code = '',
  callData = whiteBuffer(0),
  storage = {},
  accounts = {},
  address = new BN(0),
  gasLeft = new BN(0),
  caller = new BN(0),
  origin = new BN(0),
  callValue = new BN(0),
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
  }
  let isRunning = true
  while (isRunning) {
    const {
      programCounter,
      code,
     } = state
    const opCode = code[programCounter]
    console.log(`>> 0x${state.programCounter.toString(16)} ${fetch(opCode).opName}`)
    state.programCounter ++
    execute(fetch(opCode), state)
    console.log(state.stack)
    isRunning = state.programCounter < code.length
      && !state.returnValue.length
      && !state.stopped
  }
  return state
}
export default runCode
