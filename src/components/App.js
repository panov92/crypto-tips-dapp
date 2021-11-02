import React, { Component } from 'react';
import Web3 from 'web3';
import Header from './Header';
import Main from './Main';
import SocialNetwork from '../abis/SocialNetwork.json';
import Identicon from 'identicon.js';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      socialNetwork: null,
      postsCount: 0,
      posts: [],
      loading: true
    }

    this.createPost = this.createPost.bind(this);
    this.tipPost = this.tipPost.bind(this);
  }

  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    // Load account
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    // Network ID
    const networkId = await web3.eth.net.getId();
    const networkData = SocialNetwork.networks[networkId];

    if (networkData) {
      const socialNetwork = new web3.eth.Contract(SocialNetwork.abi, networkData.address);
      this.setState({ socialNetwork });
      const postsCount = await socialNetwork.methods.postsCount().call();
      this.setState({ postsCount })

      // Load Posts
      const posts = [];
      for (let i = 1; i <= postsCount; i++) {
        const post = await socialNetwork.methods.posts(i).call();
        posts.push(post);
      }

      this.setState({
        posts: this.sortPostsByTipsAmount(posts),
        loading: false
      });

    } else {
      window.alert('SocialNetwork contract not deployed to detected network.')
    }
  }

  createPost(content) {
    const { socialNetwork, account } = this.state;
    this.setState({ loading: true });
    socialNetwork.methods.createPost(content).send({ from: account })
      .once('receipt', receipt => {
        this.setState({ loading: false })
      })
  }

  sortPostsByTipsAmount(posts) {
    return posts.sort((a, b) => b.tipAmount - a.tipAmount)
  }

  tipPost(id, tipAmount) {
    const { socialNetwork, account } = this.state;
    this.setState({ loading: true });
    socialNetwork.methods.tipPost(id).send({ from: account, value: tipAmount })
      .once('receipt', receipt => {
        this.setState({ loading: false });
      })
  }

  render() {
    const { account, posts, loading } = this.state;
    return (
      <div>
        <Header account={account} />
        {loading ? (
          <div className="d-flex justify-content-center mt-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <Main tipPost={this.tipPost} createPost={this.createPost} posts={posts}  />
        )}
        
      </div>
    );
  }
}

export default App;
