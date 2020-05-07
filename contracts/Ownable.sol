pragma solidity ^0.6.0;

contract Ownable {
    address payable public owner;
    
    modifier onlyOwner {
        require(isOwner(), '401');
        _;
    }
    
    constructor() public {
        owner = msg.sender;
    }
    
    function isOwner() public view returns(bool) {
        return msg.sender == owner;
    }
    
}