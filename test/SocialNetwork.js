const SocialNetwork = artifacts.require('SocialNetwork')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('SocialNetwork', ([deployer, author, tipper]) => {
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

  describe('posts', async () => {
    let result
    let postsCount
    const content = 'This is my first post';

    before(async () => {
      result = await socialNetwork.createPost(content, { from: author })
      postsCount = await socialNetwork.postsCount()
    })

    it('creates posts', async () => {
      // Success
      assert.equal(postsCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), postsCount.toNumber(), 'id is correct')
      assert.equal(event.content, content, 'content is correct')
      assert.equal(event.tipAmount, '0', 'tipAmount is correct')
      assert.equal(event.author, author, 'author is correct')

      // Failure: Post must have content
      await socialNetwork.createPost('', { from: author }).should.be.rejected
    })

    it('lists posts', async () => {
      const post = await socialNetwork.posts(postsCount)
      assert.equal(post.id.toNumber(), postsCount.toNumber(), 'id is correct')
      assert.equal(post.content, content, 'content is correct')
      assert.equal(post.tipAmount, '0', 'tipAmount is correct')
      assert.equal(post.author, author, 'author is correct')
    })

    it('allows users to tip posts', async () => {
      // Track the author balance before purchase
      let oldAuthorBalance
      oldAuthorBalance = await web3.eth.getBalance(author)
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

      result = await socialNetwork.tipPost(postsCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') })

      // Success
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), postsCount.toNumber(), 'id is correct')
      assert.equal(event.content, content, 'content is correct')
      assert.equal(event.tipAmount, web3.utils.toWei('1', 'Ether'), 'tipAmount is correct')
      assert.equal(event.author, author, 'author is correct')

      // Check the author received funds
      let newAuthorBalance
      newAuthorBalance = await web3.eth.getBalance(author)
      newAuthorBalance = new web3.utils.BN(newAuthorBalance)

      let tipAmount
      tipAmount = web3.utils.toWei('1', 'Ether')
      tipAmount = new web3.utils.BN(tipAmount)

      const expectedBalance = oldAuthorBalance.add(tipAmount)

      assert.equal(newAuthorBalance.toString(), expectedBalance.toString())

      // Failure: Tries to tip a post that does not exist
      await socialNetwork.tipPost(99, { from: tipper, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected
      
    })
  })
})
