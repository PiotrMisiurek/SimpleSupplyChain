var SimpleSupplyChain = artifacts.require("./SimpleSupplyChain.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleSupplyChain);
};
