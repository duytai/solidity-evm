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
  }
  let isRunning = true
  while (isRunning) {
    const { programCounter, code, returnValue } = state
    const opCode = code[programCounter]
    state.programCounter ++
    execute(fetch(opCode), state)
    isRunning = programCounter <= code.length && !returnValue.length
  }
  console.log(state.returnValue.toString('hex'))
}
