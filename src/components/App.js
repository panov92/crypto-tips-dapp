import React, { Component } from 'react';
import Web3 from 'web3';
import Header from './Header';
import Main from './Main';
import SocialNetwork from '../abis/SocialNetwork.json';
import ee from "../utils/events";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      account: null,
      socialNetwork: null,
      postsCount: 0,
      posts: [],
      loading: false
    }

    this.createPost = this.createPost.bind(this);
    this.tipPost = this.tipPost.bind(this);
  }

  async componentDidMount() {
    await this.loadWeb3();
    await this.checkEvents();
    await this.loadBlockchainData();
  }

  checkEvents() {
    window.ethereum.on('accountsChanged', accounts => {
      if (accounts.length) {
        this.setState({ account: accounts[0] })
      } else {
        this.setState({ account: null })
      }
    });
    window.ethereum.on('chainChanged', async () => {
      await this.loadBlockchainData();
    });
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    else {
      toast.warning('Non-Ethereum browser detected. You should consider trying MetaMask!');
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
      const web3 = window.web3;
      const socialNetwork = new web3.eth.Contract(SocialNetwork.abi, networkData.address);
      this.loadPosts(socialNetwork);
    } else {
      this.setState({ socialNetwork: null, posts: [] });
    }
  }

  async loadPosts(socialNetwork) {
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
  }

  createPost(content) {
    const { socialNetwork, account, posts } = this.state;
    this.setState({ loading: true });
    socialNetwork.methods.createPost(content).send({ from: account })
      .once('receipt', receipt => {
        const newPost = receipt.events.PostCreated.returnValues;
        toast.success('Your post has been published successfully');
        this.setState({ loading: false, posts: this.sortPostsByTipsAmount([...posts, newPost]) })
      })
      .on('error', (error, receipt) => { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        this.setState({ loading: false })
        toast.error(error.message);
      });
  }

  sortPostsByTipsAmount(posts) {
    return posts.sort((a, b) => b.tipAmount - a.tipAmount)
  }

  tipPost(id, tipAmount) {
    const { socialNetwork, account, posts } = this.state;
    this.setState({ loading: true });
    socialNetwork.methods.tipPost(id).send({ from: account, value: tipAmount })
      .once('receipt', receipt => {
        const tippedPost = receipt.events.PostTipped.returnValues;
        const tippedPostId = tippedPost.id;
        const index = posts.findIndex(post => post.id === tippedPostId);
        let newPosts = [...posts];
        newPosts[index] = tippedPost;
        newPosts = this.sortPostsByTipsAmount(newPosts);

        toast.success('Your tip has been sent successfully');

        this.setState({ loading: false, posts: newPosts });
      })
      .on('error', (error, receipt) => { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        this.setState({ loading: false })
        toast.error(error.message);
      });
  }

  render() {
    const { account, posts, loading, socialNetwork } = this.state;
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
          <Main socialNetwork={socialNetwork}  account={account} tipPost={this.tipPost} createPost={this.createPost} posts={posts}  />
        )}
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        
      </div>
    );
  }
}

export default App;
