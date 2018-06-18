import abi from 'ethereumjs-abi'

const code = '6080604045'
const encodeABI = ({ name, types = [], values = [] }) => {
  const methodABI = abi.methodID(name, types).toString('hex')
  const methodParams = abi.rawEncode(types, values).toString('hex')
  if (name) return new Buffer(`${methodABI}${methodParams}`, 'hex')
  return new Buffer(methodParams, 'hex')
}
const constructorValues = encodeABI({
  name: '',
  types: ['int', 'string'],
  values: [9, 'LOVE']
}).toString('hex')
export default {
  code: Buffer.from(code + constructorValues, 'hex'),
  callData: encodeABI({
    name: 'getSymbol'
  })
}
