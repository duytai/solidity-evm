import abi from 'ethereumjs-abi'

export default ({ name = '', types = [], values = [] }) => {
  const methodABI = abi.methodID(name, types).toString('hex')
  const methodParams = abi.rawEncode(types, values).toString('hex')
  if (name) return new Buffer(`${methodABI}${methodParams}`, 'hex')
  return new Buffer(methodParams, 'hex')
}
