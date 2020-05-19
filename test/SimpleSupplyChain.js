const SimpleSupplyChain = artifacts.require("./SimpleSupplyChain.sol");
const PaymentReceiver = artifacts.require("./PaymentReceiver.sol")
const truffleAssert = require('truffle-assertions');

contract("SimpleSupplyChain", accounts => {
    const name = "FooBar";
    const price = 563;

    beforeEach(async function() {
        this.simpleSupplyChain = await SimpleSupplyChain.new();
    });

    describe("receive", async function(){
        it("rejects all transfers", async function(){
            await truffleAssert.reverts(
                this.simpleSupplyChain.send(price, { from: accounts[0] }),
                "We dont want your money"
            );
        })
    });

    describe("fallback", async function(){
        it("is not implemented yet", async function(){
            await truffleAssert.reverts(
                this.simpleSupplyChain.send(price, { from: accounts[0], data: "0x001" }),
                "Not implemented yet"
            )
        })
    })

    describe("listItem", async function() {
        describe("by contract owner", async function(){
            it("lists new item and creates payment receiver contract for it", async function() {
                const tx = await this.simpleSupplyChain.listItem(name, price, { from: accounts[0] });
                assert.equal(await this.simpleSupplyChain.itemsCount(), 1);
        
                const newListedItem = await this.simpleSupplyChain.items(0);
        
                assert.equal(newListedItem.name, name);
                assert.equal(newListedItem.price, price);
                assert.equal(newListedItem.state, 1);
        
                const paymentReceiver = await PaymentReceiver.at(newListedItem.paymentReceiver);
        
                assert.equal(await paymentReceiver.price(), price);
                assert.equal(await paymentReceiver.id(), 0);

                truffleAssert.eventEmitted(
                    tx,
                    "ItemListed",
                    {
                        itemId: web3.utils.toBN(0),
                        price: web3.utils.toBN(price),
                        name: name,
                        paymentReceiver: newListedItem.paymentReceiver,
                        listedBy: accounts[0]
                    }
                )
            });
        });

        describe("by not contract owner", async function(){
            it("reverts transaction", async function(){
                await truffleAssert.reverts(
                    this.simpleSupplyChain.listItem(name, price, { from: accounts[1] }),
                    "401"
                )
            });
        })
       
    });

    describe("payForItem", async function() {
        describe("listed item", async function() {
            beforeEach(async function () {
                await this.simpleSupplyChain.listItem(name, price, { from: accounts[0] });
            });

            it("accepts exact payment", async function(){
                const tx = await this.simpleSupplyChain.payForItem(0, { from: accounts[0], value: price });
                const item = await this.simpleSupplyChain.items(0);

                assert.equal(item.state, 2);

                truffleAssert.eventEmitted(tx, "ItemPaid", { itemId: web3.utils.toBN(0) });
            });

            it("rejects underpayment", async function(){
                await truffleAssert.reverts(
                    this.simpleSupplyChain.payForItem(0, { from: accounts[0], value: price - 1 }),
                    "Pay exact price"
                );
            });

            it("rejects overpayment", async function(){
                await truffleAssert.reverts(
                    this.simpleSupplyChain.payForItem(0, { from: accounts[0], value: price + 1}),
                    "Pay exact price"
                )
            });
        });

        describe("paid item", async function(){
            beforeEach(async function() {
                await this.simpleSupplyChain.listItem(name, price, { from: accounts[0] });
                await this.simpleSupplyChain.payForItem(0, { from: accounts[0], value: price });;
            });

            it("rejects payment", async function() {
                await truffleAssert.reverts(
                    this.simpleSupplyChain.payForItem(0, { from: accounts[0], value: price }), 
                    "Only listed items can be paid"
                );
            });
        });

        describe("sent item", async function() {
            beforeEach(async function(){
                await this.simpleSupplyChain.listItem(name, price, { from: accounts[0] });
                await this.simpleSupplyChain.payForItem(0, { from: accounts[0], value: price });
                await this.simpleSupplyChain.sendItem(0);
            });

            it("rejects payment", async function() {
                await truffleAssert.reverts(
                    this.simpleSupplyChain.payForItem(0, { from: accounts[0], value: price }), 
                    "Only listed items can be paid"
                );
            });
        });
    });

    describe("sendItem", async function(){
        beforeEach(async function () {
            await this.simpleSupplyChain.listItem(name, price, { from: accounts[0] });
        });

        describe("listed item", function(){
            it("reverts transaction", async function(){
                await truffleAssert.reverts(
                    this.simpleSupplyChain.sendItem(0),
                    "You can send only paid items"
                );
            });
        });

        describe("paid item", function(){
            beforeEach(async function(){
                await this.simpleSupplyChain.payForItem(0, { from: accounts[0], value: price} )
            })

            it("update items state and emit event", async function(){
                const tx = await this.simpleSupplyChain.sendItem(0);
                const item = await this.simpleSupplyChain.items(0);

                assert.equal(item.state, 3);

                truffleAssert.eventEmitted(tx, "ItemSent", { itemId: web3.utils.toBN(0), sentBy: accounts[0] });
            })
            
        });

        describe("sent item", function() {
            beforeEach(async function(){
                await this.simpleSupplyChain.payForItem(0, { from: accounts[0], value: price} )
                await this.simpleSupplyChain.sendItem(0);
            })

            it("reverts transaction", async function(){
                await truffleAssert.reverts(
                    this.simpleSupplyChain.sendItem(0),
                    "You can send only paid items"
                );
            });

        })
    })
    
});