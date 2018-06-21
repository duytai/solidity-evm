import fs from 'fs'
import { getTypes } from 'solidity-types'

const SCENARIO = JSON.parse(process.env.SCENARIO)

export default ({ buildDir, abiFileName }) => {
  const contractName = abiFileName.split('_sol_')[1]
  const scenario = SCENARIO[contractName]
  return JSON
    .parse(fs.readFileSync(`${buildDir}${abiFileName}.abi`, 'utf8'))
    .map((func) => {
      const scenario = SCENARIO[contractName]
      for (let i = 0; i < func.inputs.length; i++) {
        if (scenario) {
          func.inputs[i].value = scenario[func.name || func.type][i]
        } else {
          func.inputs[i].value = getTypes(func.inputs[i].type).random()
        }
      }
      return func 
    })
}
