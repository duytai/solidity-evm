export default () => {
  const address = Buffer.from([...Array(20).keys()].map(i => Math.round(Math.random() * 255)))
  return address.toString('hex')
}
