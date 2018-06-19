import shell from 'shelljs'
import inquirer from 'inquirer'
import colors from 'colors'
import { deployContract, callMethod } from './src/lib'
import runCode from './src/runCode'

(async () => {
  const accounts = {}
  const contractDir = `${shell.pwd()}/contracts/`
  const buildDir = `${shell.pwd()}/build/`
  const { compile, logOptions } = await inquirer.prompt([
    {
      type: 'list',
      name: 'compile',
      message: 'Do you want to compile contracts ?',
      choices: ['No', 'Yes'],
    },
    {
      type: 'checkbox',
      name: 'logOptions',
      message: 'Log options',
      choices: ['OPCODE', 'STACK'],
      default: [],
    },
  ])
  if (compile === 'Yes') {
    shell.cd(contractDir).exec('solcjs --abi --bin *.sol')
    shell.mv('*.bin', buildDir)
    shell.mv('*.abi', buildDir)
  }
  shell.cd(buildDir)
  await deployContract({
    buildDir,
    accounts,
    runCode,
    logOptions,
  })
  await callMethod({
    buildDir,
    accounts,
    runCode,
    logOptions,
  })
})()
