pragma solidity ^0.6.0;

import './Ownable.sol';
import './PaymentReceiver.sol';

contract SimpleSupplyChain is Ownable {
    address constant addressZero = address(0);
    
    mapping(uint => Item) public items;
    uint public itemsCount;

    event ItemListed(uint indexed itemId, uint price, string name, address indexed paymentReceiver, address listedBy);
    event ItemPaid(uint indexed itemId);
    event ItemSent(uint indexed itemId, address indexed sentBy);

    enum ItemState{NotExisting, Listed, Paid, Sent}
    
    struct Item {
        PaymentReceiver paymentReceiver;
        string name;
        uint price;
        ItemState state;
    }
    
    function listItem(string memory _name, uint _price) public onlyOwner{
        // TO DO walidacja pramsów
        Item memory newItem = Item({ 
            name: _name,
            price: _price,
            state: ItemState.Listed,
            paymentReceiver: new PaymentReceiver(this, _price, itemsCount)
        });
        
        emit ItemListed(itemsCount, _price, _name, address(newItem.paymentReceiver), msg.sender);

        items[itemsCount++] = newItem;
    }
    
    function payForItem(uint _itemId) payable public {
        require(items[_itemId].state == ItemState.Listed, 'Only listed items can be paid');
        require(msg.value == items[_itemId].price, 'Pay exact price');
        items[_itemId].state = ItemState.Paid;
    
        emit ItemPaid(_itemId);
    }
    
    function sendItem(uint _itemId) public onlyOwner {
        // TO DO whitelist of allowed sender addreses 
        
        require(items[_itemId].state == ItemState.Paid, 'You can send only paid items');
        
        items[_itemId].state = ItemState.Sent;
        
        emit ItemSent(_itemId, msg.sender);
    }
    
    receive() payable external {
        revert('We dont want your money');
    }
    
    fallback() payable external {
        // TODO: allow to recieve funds with itemId in msg.data
        // https://solidity.readthedocs.io/en/v0.6.6/contracts.html#fallback-function
        revert('Not implemented yet');
    }
}