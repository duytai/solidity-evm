import runCode from './src/runCode'

const code = '60056004016000526001601ff3'
runCode({
  code: Buffer.from(code, 'hex')
})
