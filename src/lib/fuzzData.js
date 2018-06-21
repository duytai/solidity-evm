import fs from 'fs'
import { getTypes } from 'solidity-types'

export default ({ buildDir, abiFileName }) => JSON
  .parse(fs.readFileSync(`${buildDir}${abiFileName}.abi`, 'utf8'))
  .map(v => {
    v.inputs = v.inputs.map(i => {
      i.value = getTypes(i.type).random()
      return i
    })
    return v
  })
