import inquirer from 'inquirer'
import BN from 'bn.js'
import encodeABI from './encodeABI'
import fuzzData from './fuzzData'

export default async ({
  buildDir,
  accounts,
  logOptions,
  runCode,
}) => {
  const { address } = await inquirer.prompt([
    {
      type: 'list',
      name: 'address',
      message: 'Load contract from address',
      choices: Object
        .keys(accounts)
        .map(addr => ({
          name: `${addr} | ${accounts[addr].abiFileName}`,
          value: addr,
        })),
    },
  ])
  const account = accounts[address]
  if (!account) {
    console.log('>> Contract does not exists'.red)
    process.exit()
  }
  const { abiFileName } = account
  const abi = fuzzData({ buildDir, abiFileName })
  const { method } = await inquirer.prompt([
    {
      type: 'list',
      name: 'method',
      message: 'Choose contract method',
      choices: abi.filter(({ type }) => type !== 'constructor').map(({ name }) => name),
    },
  ])
  const func = abi.find(({ name }) => name === method)
  const callData = encodeABI({
    name: method,
    types: func.inputs.map(({ type }) => type),
    values: func.inputs.map(({ value }) => value),
  })
  console.log(`>> Params: ${func.inputs.map(({ value }) => value)}`)
  // METHOD CALL
  const { returnValue } = runCode({
    logOptions,
    accounts,
    callData,
    code: account.code,
    storage: account.storage,
    address: new BN(address, 'hex'),
    gasLeft: new BN(1000),
    caller: new BN(address, 'hex'),
  })
  console.log(`>> Return value: ${returnValue.toString('hex').green}`)
}
