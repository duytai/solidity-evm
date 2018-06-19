import inquirer from 'inquirer'
import fs from 'fs'
import shell from 'shelljs'
import BN from 'bn.js'
import encodeABI from './encodeABI'
import fuzzData from './fuzzData'
import randomAddress from './randomAddress'

export default async ({
  buildDir,
  accounts,
  logOptions,
  runCode
}) => {
  const { contractName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'contractName',
      message: 'Choose your contract to deploy',
      choices: shell.ls('*.abi').map(i => i.replace('.abi', '')),
    },
  ])
  const abi = fuzzData({ buildDir, contractName })
  const con = abi.find(({ type }) => type === 'constructor')
  const conParam = encodeABI({
    name: '',
    types: con.inputs.map(({ type }) => type),
    values: con.inputs.map(({ value }) => value),
  })
  const code = fs.readFileSync(`${contractName}.bin`, 'utf8')
  // CONTRACT ACCOUNT
  const address = randomAddress()
  accounts[address] = {
    code: Buffer.concat([
      Buffer.from(code, 'hex'),
      conParam,
    ]),
    balance: 0,
    storage: {},
    contractName,
  }
  // DEPLOY CONTRACT
  const { returnValue } = runCode({
    logOptions,
    accounts,
    code: accounts[address].code,
    storage: accounts[address].storage,
    address: new BN(address, 'hex'),
    gasLeft: new BN(1000),
    caller: new BN(address, 'hex'),
  })
  accounts[address].code = returnValue
  console.log(`>> Contract Address: ${address.green}`)
}
