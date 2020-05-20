const truffleAssert = require("truffle-assertions");
const Whitelistable = artifacts.require("./WhiteListable.sol");

contract("Whitelistable", accounts => {
    beforeEach(async function(){
        this.whitelistable = await Whitelistable.new();
    });

    describe("constructor", async function(){
        it("whitelists deployer", async function(){
            const isAddressWhitelisted = await this.whitelistable.isWhitelisted(accounts[0]);

            assert.equal(isAddressWhitelisted, true);
        })
    });

    describe("addToWhitelist", async function(){
        describe("by owner", async function() {
            it("whitelists passed address and emit the event", async function(){
                const tx = await this.whitelistable.addToWhitelist(accounts[1]);

                truffleAssert.eventEmitted(tx, "AddressAdded", { addedAddress: accounts[1] });

                const isAddressWhitelisted = await this.whitelistable.isWhitelisted(accounts[1]);
                assert.equal(isAddressWhitelisted, true);
            })
        });

        describe("by not owner", async function(){
            it("reverts transaction", async function(){
                await truffleAssert.reverts(
                    this.whitelistable.addToWhitelist(accounts[1], { from: accounts[1] }),
                    "401"
                );
            });
        });
    });

    describe("removeFromWhiteList", async function() {
        describe("by owner", async function(){
            it("removes passed address from whitelist and emit event", async function() {
                const tx = await this.whitelistable.removeFromWhitelist(accounts[0]);

                truffleAssert.eventEmitted(tx, "AddressRemoved", { removedAddress: accounts[0] });

                const isAddressWhitelisted = await this.whitelistable.isWhitelisted(accounts[0]);
                assert.equal(isAddressWhitelisted, false);
            });
        });

        describe("by not owner", async function() {
            it("reverts transaction", async function () {
                await truffleAssert.reverts(
                    this.whitelistable.removeFromWhitelist(accounts[0], { from: accounts[1] }),
                    "401"
                );
            });
        })
    });

    describe("isWhitelisted", async function() {
        describe("with whitelisted address", async function(){
            it("returns true", async function() {
                assert.equal(await this.whitelistable.isWhitelisted(accounts[0]), true);
            });
        });

        describe("whit not whitelisted address", async function(){
            it("returns false", async function() {
                assert.equal(await this.whitelistable.isWhitelisted(accounts[1]), false);
            });
        });
    });
});
