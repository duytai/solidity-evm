import runCode from './src/runCode'

const code = '600560040b'
runCode({
  code: Buffer.from(code, 'hex')
})
