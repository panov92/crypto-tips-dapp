const SocialNetwork = artifacts.require('SocialNetwork')

contract('SocialNetwork', (accounts) => {
  let socialNetwork

  before(async () => {
    socialNetwork = await SocialNetwork.deployed()
  })

  describe('deployment', () => {
    it('deploys successfully', async () => {
      
      const address = await socialNetwork.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await socialNetwork.name()
      assert.equal(name, 'Social Network')
    })
  })
})
