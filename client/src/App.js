import React, { Component } from "react";
import SimpleSupplyChainContract from "./contracts/SimpleSupplyChain.json";
import PaymentReceiverContract from "./contracts/PaymentReceiver.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = {  loaded: false, price: 0, name: "", lastMessage: null, listedItems: [] };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();
      this.deployedNetwork = SimpleSupplyChainContract.networks[this.networkId];
      
      this.simpleSupplyChain = new this.web3.eth.Contract(
        SimpleSupplyChainContract.abi,
        this.deployedNetwork && this.deployedNetwork.address,
      );

      this.deployedNetwork = PaymentReceiverContract.networks[this.networkId];

      this.paymentReceiver = new this.web3.eth.Contract(
        PaymentReceiverContract.abi,
        this.deployedNetwork && this.deployedNetwork.address
      )

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ loaded: true});
      this.getListedItems();
      this.listenForPayments();
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  inputChanges = (event) => {
    const target = event.target;
    const name = target.name;
    const value = target.type === "checkbox" ? target.checked : target.value;

    this.setState({[name]: value});
  }

  listItem = async() => {
    const { price, name } = this.state;

    let result = await this.simpleSupplyChain.methods.listItem(name, price).send({ from: this.accounts[0] });

    const returnValues = result.events.ItemStateChanged.returnValues;
    this.setState({lastMessage: "Item listed. You can pay " + returnValues._price + "  for it here " + returnValues._paymentReceiver});
  }

  listenForPayments = () => {
    this.simpleSupplyChain.events.ItemStateChanged().on("data", async (event) => {
      if (event.returnValues._state === "2") {
        this.setState({ lastMessage: "Item #" + event.returnValues._itemId +" paid by " + event.returnValues._sender} );
      }
    });
  }

  getListedItems = async() => {
    let listedItems = []
    const listedItemsCount = parseInt(await(this.simpleSupplyChain.methods.itemsCount().call()));
    const states = ['not existing', 'listed', 'paid', 'sent'];
    let itemId = 0;
    
    while (itemId < listedItemsCount) {
      let item = await(this.simpleSupplyChain.methods.items(itemId).call());
      let state = states[item.state];
      listedItems[itemId] = `#${itemId}: ${item.name} for ${item.price}(${state})`;
      itemId++;
    }

    this.setState({ listedItems: listedItems });
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Simple Supply Chain</h1>
        <div>{this.state.lastMessage}</div>
        <h2>Listed items:</h2>
        <ul>{this.state.listedItems.map(item => <li>{item}</li>)}</ul>
        <h2>List new item</h2>
        <input type="text" name="price" placeholder="Price in Wei" value={this.state.price} onChange={this.inputChanges} />
        <input type="text" name="name" placeholder="Name" value={this.state.name} onChange={this.inputChanges} />
        <button onClick={this.listItem}>Add item</button>
      </div>
    );
  }
}

export default App;
