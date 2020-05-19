pragma solidity ^0.6.0;

import './SimpleSupplyChain.sol';

contract PaymentReceiver {
    uint public price;
    uint public id;
    
    SimpleSupplyChain parentContract;

    event Paid(uint indexed itemId, address indexed sender);
    
    constructor(SimpleSupplyChain _parentContract, uint _price, uint _id) public {
        parentContract = _parentContract;
        price = _price;
        id = _id;
    }
    
    receive() payable external {
        (bool success, ) = address(parentContract).call{ value: msg.value }(abi.encodeWithSignature('payForItem(uint256)', id));
        
        require(success, 'Item cant be paid');

        emit Paid(id, msg.sender);
    }
    
    fallback() external {}
}