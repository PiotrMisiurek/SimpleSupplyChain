const SimpleSupplyChain = artifacts.require("./SimpleSupplyChain.sol");
const PaymentReceiver = artifacts.require("./PaymentReceiver.sol");
const truffleAssert = require('truffle-assertions');

contract("PaymentReceiver", accounts => {
    const price = 123;

    beforeEach(async function(){
        this.parentContract = await SimpleSupplyChain.new();
        await this.parentContract.listItem("foo", price, { from: accounts[0] });
        const item = await this.parentContract.items(0);
        this.paymentReceiver = await PaymentReceiver.at(item.paymentReceiver);
    })

    describe("receive", async function (){
         describe("exact value", async function() {
            it("emits Paid event and marks item as paid", async function(){
                const tx = await this.paymentReceiver.send(price, { from: accounts[0] });
                const paidItem = await this.parentContract.items(0);

                assert.equal(paidItem.state, 2);
                truffleAssert.eventEmitted(tx, "Paid", { itemId: web3.utils.toBN(0), sender: accounts[0] });
            })
         });

         describe("undervalued", function() {
            it("reverts transaction", async function(){
                await truffleAssert.reverts(
                    this.paymentReceiver.send(price - 1, { from: accounts[0] }),
                    "Item cant be paid"
                );
            });
         });

         describe("overvalued", function() {
            it("reverts transaction", async function(){
                await truffleAssert.reverts(
                    this.paymentReceiver.send(price + 1, { from: accounts[0] }),
                    "Item cant be paid"
                );
            });
         });

         describe("second payment", function() {
            beforeEach(async function(){
                await this.paymentReceiver.send(price, { from: accounts[0] });
            });

            it("reverts transaction", async function(){
                await truffleAssert.reverts(
                    this.paymentReceiver.send(price, { from: accounts[0] }),
                    "Item cant be paid"
                );
            });
         });
    });
});