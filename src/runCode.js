import BN from 'bn.js'
import fetch from './opcodes'
import execute from './execute'

export default ({ code = ''}) => {
  const state = {
    programCounter: 0,
    code,
    stack: [],
    memory: [],
    callValue: new BN(0),
    returnValue: false,
    stopped: false,
  }
  let isRunning = true
  while (isRunning) {
    const {
      programCounter,
      code,
     } = state
    const opCode = code[programCounter]
    state.programCounter ++
    execute(fetch(opCode), state)
    isRunning = state.programCounter < code.length
      && !state.returnValue.length
      && !state.stopped
  }
}
