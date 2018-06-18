import randomSeed from 'random-seed'

const rand = randomSeed.create(0)
export default () => {
  const address = Buffer.from([...Array(20).keys()].map(i => rand(255)))
  return address.toString('hex')
}
