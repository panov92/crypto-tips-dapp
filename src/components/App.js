import React, { Component } from 'react';
import Web3 from 'web3';
import Header from './Header';
import SocialNetwork from '../abis/SocialNetwork.json';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      account: ''
    }
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
    } else {
      window.alert('SocialNetwork contract not deployed to detected network.')
    }
  }

  render() {
    const { account } = this.state;
    return (
      <div>
        <Header account={account} />
        <div className="container mt-5">
          <div className="row">
            <main role="main" className="col-12 d-flex text-center">
              <div className="content">
                123
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
