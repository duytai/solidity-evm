import BN from 'bn.js'
import createKeccakHash from 'keccak'

const TWO_POW256 = new BN('10000000000000000000000000000000000000000000000000000000000000000', 16)
const keccak = buf => createKeccakHash('keccak256').update(buf).digest()
export default ({ opCode, opName, numIns, numOuts }, state) => {
  const {
    programCounter,
    stack,
    code,
    memory,
    callValue,
    stopped,
    address,
    storage,
    accounts,
    origin,
    caller,
    callData,
  } = state
  switch (opName) {
    // 0s: Stop and Arithmetic Operations
    case 'STOP': {
      state.stopped = true
      break
    }
    case 'ADD': {
      const a = stack.pop()
      const b = stack.pop()
      stack.push(a.add(b).mod(TWO_POW256))
      break
    }
    case 'MUL': {
      const a = stack.pop()
      const b = stack.pop()
      stack.push(a.mul(b).mod(TWO_POW256))
      break
    }
    case 'SUB': {
      const a = stack.pop()
      const b = stack.pop()
      stack.push(a.sub(b).toTwos(256))
      break
    }
    case 'DIV': {
      const a = stack.pop()
      const b = stack.pop()
      if (b.isZero()) {
        stack.push(new BN(0))
      } else {
        stack.push(a.div(b))
      }
      break
    }
    case 'SDIV': {
      const a = stack.pop()
      const b = stack.pop()
      if (b.isZero()) {
        stack.push(new BN(b))
      } else {
        const x = a.fromTwos(256)
        const y = b.fromTwos(256)
        stack.push(x.div(y).toTwos(256))
      }
      break
    }
    case 'MOD': {
      const a = stack.pop()
      const b = stack.pop()
      if (b.isZero()) {
        stack.push(b)
      } else {
        stack.push(a.mod(b))
      }
      break
    }
    case 'SMOD': {
      const a = stack.pop()
      const b = stack.pop()
      if (b.isZero()) {
        stack.push(b)
      } else {
        const x = a.fromTwos(256)
        const y = b.fromTwos(256)
        let r = a.abs().mod(b.abs())
        if (x.isNeg()) {
          r = r.ineg()
        }
        stack.push(r.toTwos(256))
      }
      break
    }
    case 'ADDMOD': {
      const a = stack.pop()
      const b = stack.pop()
      const c = stack.pop()
      if (c.isZero()) {
        stack.push(c)
      } else {
        stack.push(a.add(b).mod(c))
      }
      break
    }
    case 'MULMOD': {
      const a = stack.pop()
      const b = stack.pop()
      const c = stack.pop()
      if (c.isZero()) {
        stack.push(c)
      } else {
        stack.push(a.mul(b).mod(c))
      }
      break
    }
    case 'EXP': {
      const base = stack.pop()
      const exponent = stack.pop()
      const m = BN.red(TWO_POW256)
      const redBase = base.toRed(m)
      if (!exponent.isZero()) {
        stack.push(redBase.redPow(exponent))
      } else {
        stack.push(new BN(1))
      }
      break
    }
    case 'SIGNEXTEND': {
      let k = stack.pop()
      const val = stack.pop().toArrayLike(Buffer, 'be', 32)
      let extendOnes = false
      if (k.lten(31)) {
        k = k.toNumber()
        if (val[31 - k] & 0x80) {
          extendOnes = true
        }
        // 31-k-1 since k-th byte shouldn't be modified
        for (let i = 30 - k; i >= 0; i--) {
          val[i] = extendOnes ? 0xff : 0
        }
      }
      stack.push(new BN(val))
      break
    }
    case 'LT': {
      const a = stack.pop()
      const b = stack.pop()
      stack.push(new BN(a.lt(b) ? 1 : 0))
      break
    }
    case 'GT': {
      const a = stack.pop()
      const b = stack.pop()
      stack.push(new BN(a.gt(b) ? 1 : 0))
      break
    }
    case 'SLT': {
      const a = stack.pop()
      const b = stack.pop()
      const r = new BN(a.fromTwos(256).lt(b.fromTwos(256)) ? 1 : 0)
      stack.push(r)
      break
    }
    case 'SGT': {
      const a = stack.pop()
      const b = stack.pop()
      const r = new BN(a.fromTwos(256).gt(b.fromTwos(256)) ? 1 : 0)
      stack.push(r)
      break
    }
    case 'EQ': {
      const a = stack.pop()
      const b = stack.pop()
      const r = new BN(a.eq(b) ? 1 : 0)
      stack.push(r)
      break
    }
    case 'ISZERO': {
      const a = stack.pop()
      const r = new BN(a.isZero() ? 1 : 0)
      stack.push(r)
      break
    }
    case 'AND': {
      const a = stack.pop()
      const b = stack.pop()
      stack.push(a.and(b))
      break
    }
    case 'OR': {
      const a = stack.pop()
      const b = stack.pop()
      stack.push(a.or(b))
      break
    }
    case 'XOR': {
      const a = stack.pop()
      const b = stack.pop()
      stack.push(a.xor(b))
      break
    }
    case 'NOT': {
      const a = stack.pop()
      stack.push(a.notn(256))
      break
    }
    case 'BYTE': {
      const pos = stack.pop()
      const word = stack.pop()
      if (pos.gten(32)) {
        stack.push(new BN(0))
      } else {
        const r = new BN(word.shrn((31 - pos.toNumber()) * 8).andln(0xff))
        stack.push(r)
      }
      break
    }
    case 'SHA3': {
      const offset = stack.pop().toNumber()
      const length = stack.pop().toNumber()
      const data = Buffer.from(memory.slice(offset, offset + length))
      stack.push(keccak(data))
      break
    }
    case 'ADDRESS': {
      stack.push(address)
      break
    }
    case 'BALANCE': {
      const address = stack.pop().toString('hex')
      const balance = accounts[address] ? new BN(accounts[address]) : new BN(0)
      stack.push(balance)
      break
    }
    case 'ORIGIN': {
      stack.push(origin)
      break
    }
    case 'CALLER': {
      stack.push(caller)
    }
    case 'CALLVALUE': {
      stack.push(callValue)
      break
    }
    case 'CALLDATALOAD': {
      const pos = stack.pop().toNumber()
      if (pos > callData.length) {
        stack.push(new BN(0))
      } else {
        const data = callData.slice(pos, pos + 32)
        stack.push(new BN(data))
      }
      break
    }
    case 'CALLDATASIZE': {
      stack.push(new BN(callData.length))
      break
    }
    case 'CALLDATACOPY': {
      const memOffset = stack.pop().toNumber()
      const dataOffset = stack.pop().toNumber()
      const dataLength = stack.pop().toNumber()
      const data = callData.slice(dataOffset, dataOffset + dataLength)
      for (let i = 0; i < data.length; i++) {
        memory[memOffset + i] = data[i]
      }
      break
    }
    case 'CODESIZE': {
      stack.push(new BN(code.length))
      break
    }
    case 'CODECOPY': {
      const memOffset = stack.pop().toNumber()
      const codeOffset = stack.pop().toNumber()
      const codeLength = stack.pop().toNumber()
      const data = code.slice(codeOffset, codeOffset + codeLength)
      for (let i = 0; i < data.length; i++) {
        memory[i + memOffset] = data[i]
      }
      break
    }
    case 'EXTCODESIZE': {
      //TODO
      break
    }
    case 'EXTCODECOPY': {
      //TODO
      break
    }
    case 'BLOCKHASH': {
      //TODO
      break
    }
    case 'COINBASE': {
      //TODO
      break
    }
    case 'TIMESTAMP': {
      //TODO
      break
    }
    case 'NUMBER': {
      //TODO
      break
    }
    case 'DIFFICULTY': {
      break
    }
    case 'GASLIMIT': {
      break
    }
    case 'POP': {
      stack.pop()
      break
    }
    case 'MLOAD': {
      const memOffset = stack.pop().toNumber()
      const data = memory.slice(memOffset, memOffset + 32)
      stack.push(Buffer.from(data))
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
    case 'MSTORE8': {
      const memOffset = stack.pop()
      const byte = Buffer.from([ stack.pop().andln(0xff) ])
      memory[memOffset] = byte[0]
      break
    }
    case 'SLOAD': {
      const key = stack.pop().toString('hex')
      const value = storage[key]
      stack.push(value)
      break
    }
    case 'SSTORE': {
      const key = stack.pop().toString('hex')
      const value = stack.pop()
      storage[key] = value
      break
    }
    case 'JUMP': {
      const dest = stack.pop().toNumber()
      state.programCounter = dest
      break
    }
    case 'JUMPI': {
      const dest = stack.pop().toNumber()
      const cond = stack.pop()
      if (!cond.isZero()) {
        state.programCounter = dest
      }
      break
    }
    case 'PC': {
      stack.push(new BN(programCounter - 1))
      break
    }
    case 'MSIZE': {
      stack.push(new BN(memory.length * 32))
      break
    }
    case 'GAS': {
      // TODO
      break
    }
    case 'JUMPDEST': {
      // TODO
      break
    }
    case 'PUSH': {
      const numToPush = opCode - 0x5f
      const data = new BN(code.slice(programCounter, programCounter + numToPush).toString('hex'), 16)
      stack.push(data)
      state.programCounter += numToPush
      break
    }
    case 'DUP': {
      const position = stack.length - 1 - (opCode - 0x80)
      const value = stack[position]
      stack.push(value)
      break
    }
    case 'SWAP': {
      const stackPos = opCode - 0x8f
      const swapIndex = stack.length - stackPos - 1
      const topIndex = stack.length - 1
      const tmp = stack[topIndex]
      stack[topIndex] = stack[swapIndex]
      stack[swapIndex] = tmp
      break
    }
    case 'LOG': {
      break
    }
    case 'CREATE': {
      //TODO
      break
    }
    case 'CALL': {
      //TODO
      break
    }
    case 'CALLCODE': {
      //TODO
      break
    }
    case 'RETURN': {
      const offset = stack.pop().toNumber()
      const length = stack.pop().toNumber()
      const val = memory.slice(offset, offset + length)
      state.returnValue = Buffer.from(val)
      break
    }
    case 'DELEGATECALL': {
      //TODO
      break
    }
    case 'SUICIDE': {
      //TODO
      break
    }
  }
}
