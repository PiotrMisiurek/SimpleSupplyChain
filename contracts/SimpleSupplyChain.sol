pragma solidity ^0.6.0;

import './Ownable.sol';
import './PaymentReceiver.sol';

contract SimpleSupplyChain is Ownable {
    address constant addressZero = address(0);
    
    mapping(uint => Item) public items;
    uint public itemsCount;

    event ItemStateChanged(uint indexed _itemId, uint8 _state, uint _price, address indexed _sender, address indexed _paymentReceiver);


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
        
        emit ItemStateChanged(itemsCount, uint8(newItem.state), _price, msg.sender, address(newItem.paymentReceiver));
        
        items[itemsCount++] = newItem;
    }
    
    function payForItem(uint _itemId) payable public {
        require(items[_itemId].state == ItemState.Listed, 'Only listed items can be paid');
        require(msg.value == items[_itemId].price, 'Pay exact price');
        items[_itemId].state = ItemState.Paid;
    
        emit ItemStateChanged(_itemId, uint8(items[_itemId].state), msg.value, msg.sender, address(items[_itemId].paymentReceiver));
    }
    
    function sendItem(uint _itemId) public onlyOwner {
        // TO DO whitelist of allowed sender addreses 
        
        require(items[_itemId].state == ItemState.Paid, 'You can send only paid items');
        
        items[_itemId].state = ItemState.Sent;
        
        emit ItemStateChanged(_itemId, uint8(items[_itemId].state), items[_itemId].price, msg.sender, address(items[_itemId].paymentReceiver));
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