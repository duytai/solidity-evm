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
  runCode,
  currentUserAddress,
}) => {
  const { abiFileName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'abiFileName',
      message: 'Choose your contract to deploy',
      choices: shell.ls('*.abi').map(i => i.replace('.abi', '')),
    },
  ])
  const abi = fuzzData({ buildDir, abiFileName })
  const con = abi.find(({ type }) => type === 'constructor')
  let conParam = Buffer.from([])
  if (con) {
    console.log(`>> Constructor ${con.inputs.map(v => v.value)}`)
    conParam = encodeABI({
      name: '',
      types: con.inputs.map(({ type }) => type),
      values: con.inputs.map(({ value }) => value),
    })
  }
  const code = fs.readFileSync(`${abiFileName}.bin`, 'utf8')
  // CONTRACT ACCOUNT
  const address = randomAddress()
  accounts[address] = {
    code: Buffer.concat([
      Buffer.from(code, 'hex'),
      conParam,
    ]),
    balance: 0,
    storage: {},
    abiFileName,
  }
  // DEPLOY CONTRACT
  const logs = []
  const { returnValue } = runCode({
    logOptions,
    accounts,
    code: accounts[address].code,
    storage: accounts[address].storage,
    address: new BN(address, 'hex'),
    gasLeft: new BN(1000),
    caller: new BN(currentUserAddress, 'hex'),
    origin: new BN(currentUserAddress, 'hex'),
    logs,
  })
  accounts[address].code = returnValue
  console.log(`>> Contract Address: ${address.green}`)
  console.log(logs)
}
