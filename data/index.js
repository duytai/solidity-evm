import abi from 'ethereumjs-abi'

const code = '60806040526000805534801561001457600080fd5b50606460008190555060ba8061002b6000396000f300608060405260043610603f576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680636d4ce63c146044575b600080fd5b348015604f57600080fd5b506056606c565b6040518082815260200191505060405180910390f35b60008060786000546081565b90508091505090565b60006002820290509190505600a165627a7a72305820a75b62a951c6e69362cc2d0dbb1d27a08ed0c86f49e8de439ed728feeed8a1cd0029'
const encodeABI = ({ name, types = [], values = [] }) => {
  const methodABI = abi.methodID(name, types).toString('hex')
  const methodParams = abi.rawEncode(types, values).toString('hex')
  if (name) return new Buffer(`${methodABI}${methodParams}`, 'hex')
  return new Buffer(methodParams, 'hex')
}
const constructorValues = encodeABI({
  name: '',
  types: [],
  values: []
}).toString('hex')
export default {
  code: Buffer.from(code + constructorValues, 'hex'),
  callData: encodeABI({
    name: 'get'
  })
}
