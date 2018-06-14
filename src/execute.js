import BN from 'bn.js'

const TWO_POW256 = new BN('10000000000000000000000000000000000000000000000000000000000000000', 16)
const storage = {} // key - value storage
export default ({ opCode, opName, numIns, numOuts }, state) => {
  const {
    programCounter,
    stack,
    code,
    memory,
    callValue,
  } = state
  switch (opName) {
    // 0s: Stop and Arithmetic Operations
    case 'ADD': {
      const a = stack.pop()
      const b = stack.pop()
      stack.push(a.add(b).mod(TWO_POW256))
      break
    }
    case 'PUSH': {
      const numToPush = opCode - 0x5f
      const data = new BN(code.slice(programCounter, programCounter + numToPush).toString('hex'), 16)
      stack.push(data)
      state.programCounter += numToPush
      break
    }
    case 'MSTORE': {
      const offset = stack.pop().toNumber()
      const value = stack.pop().toArrayLike(Buffer, 'be', 32)
      for (let i = 0; i < 32; i++) {
        memory[offset + i] = value[i]
      }
      break
    }
    case 'SSTORE': {
      const key = stack.pop().toString('hex')
      const value = stack.pop()
      storage[key] = value
      break
    }
    case 'CALLVALUE': {
      stack.push(callValue)
      break
    }
    case 'DUP': {
      const position = stack.length - 1 - (opCode - 0x80)
      const value = stack[position]
      stack.push(value)
      break
    }
    case 'RETURN': {
      const offset = stack.pop().toNumber()
      const length = stack.pop().toNumber()
      const val = memory.slice(offset, offset + length)
      state.returnValue = Buffer.from(val)
      break
    }
  }
}
