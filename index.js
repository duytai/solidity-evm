import runCode from './src/runCode'

const code = '60056004006004'
runCode({
  code: Buffer.from(code, 'hex')
})
