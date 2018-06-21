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
  let isRunning = true
  while (isRunning) {
    const { nextStep } = await inquirer.prompt([
      {
        type: 'list',
        name: 'nextStep',
        message: 'do you want to DEPLOY / CALLMETHOD / EXIT',
        choices: ['DEPLOY', 'CALLMETHOD', 'EXIT'],
      },
    ])
    switch (nextStep) {
      case 'DEPLOY':
        await deployContract({
          buildDir,
          accounts,
          runCode,
          logOptions,
        })
        break
      case 'CALLMETHOD':
        await callMethod({
          buildDir,
          accounts,
          runCode,
          logOptions,
        })
        break
      case 'EXIT':
        isRunning = false
        break
      default:
        break
    }
  }
})()
