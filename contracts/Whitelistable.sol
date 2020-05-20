pragma  solidity ^0.6.0;

import "./Ownable.sol";

contract Whitelistable is Ownable {
    mapping(address => bool) private whitelist;

    event AddressAdded(address indexed addedAddress);
    event AddressRemoved(address indexed removedAddress);

    modifier onlyWhitelisted {
        require(isWhitelisted(msg.sender) == true, "401");
        _;
    }
    constructor() public {
        whitelist[msg.sender] = true;
    }

    function addToWhitelist(address _address) public onlyOwner {
        whitelist[_address] = true;
        emit AddressAdded(_address);
    }

    function removeFromWhitelist(address _address) public onlyOwner {
        whitelist[_address] = false;
        emit AddressRemoved(_address);
    }

    function isWhitelisted(address _address) public view returns(bool) {
        return whitelist[_address];
    }
}