const SimpleSupplyChain = artifacts.require("./SimpleSupplyChain.sol");
const PaymentReceiver = artifacts.require("./PaymentReceiver.sol")

contract("SimpleSupplyChain", accounts => {
    it("allows to list new item", async function() {
        const simpleSupplyChain = await SimpleSupplyChain.deployed();
        const name = "FooBar";
        const price = 563;
    
        const tx = await simpleSupplyChain.listItem(name, price, { from: accounts[0] });

        assert.equal(tx.logs[0].args._state, 1);
        assert.equal(tx.logs[0].args._itemId, 0);

        assert.equal(await simpleSupplyChain.itemsCount(), 1);

        const newListedItem = await simpleSupplyChain.items(0);

        assert.equal(newListedItem.name, name);
        assert.equal(newListedItem.price, price);
        assert.equal(newListedItem.state, 1);

        const paymentReceiver = await PaymentReceiver.at(newListedItem.paymentReceiver);

        assert.equal(await paymentReceiver.price(), price);
        assert.equal(await paymentReceiver.id(), 0);
    });
    
});