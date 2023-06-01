// SPDX-License-Identifier: MIT 

pragma solidity ^0.8.0;

contract Tracking {

    enum ShipmentStatus { PENDING, IN_TRANSIT, DELIVERED}
//storing the data of the shipment.
    struct Shipment {
        address sender;
        address receiver;
        uint256 pickupTime;
        uint256 deliveryTime;
        uint256 distance;
        uint256 price;
        ShipmentStatus status;
        bool isPaid;
    }
//shipping mapping 
    mapping(address => Shipment[]) public shipments;


    uint256 public shipmentCount;

// for the frontend and display 
    struct TypeShipment {
        address sender;
        address receiver;
        uint256 pickupTime;
        uint256 deliveryTime;
        uint256 distance;
        uint256 price;
        ShipmentStatus status;
        bool isPaid;


    }

    TypeShipment[] typeShipments;

    //keep entire shipment to fetch and push it to the fronend
    event ShipmentCreated (address indexed sender, address indexed receiver, uint256 pickuptime, uint256 distance, uint256 price);
    event ShipmentInTransit(address indexed sender, address indexed receiver, uint256 pickuptime);
    event ShipmentDelivered(address indexed sender, address indexed receiver, uint256 deliveryTime);
    event ShipmentPaid(address indexed sender, address indexed receiver, uint256 amount);


    constructor() {
        shipmentCount = 0;
    }

//anybody can call the function 
    function createShipment (address _receiver, uint256 _pickupTime, uint256 _distance, uint256 _price)  public payable {


        require(msg.value == _price, "  Payment amount must match the price.");
        //update data

        Shipment memory shipment = Shipment(msg.sender, _receiver, _pickupTime, 0, _distance, _price, ShipmentStatus.PENDING, false);
//push data to out array. 
        shipments[msg.sender].push(shipment);
        shipmentCount++;  // kep track 

        typeShipments.push(
            TypeShipment(
                msg.sender,
                _receiver,
                _pickupTime,
                0,
                _distance,
                _price,
                ShipmentStatus.PENDING,
                false
            )
        );

        emit ShipmentCreated(msg.sender, _receiver, _pickupTime, _distance, _price);
    }


    function startShipment(address _sender, address _receiver, uint256 _index) public{
        //update status 
        Shipment storage shipment = shipments[_sender][_index];
        TypeShipment storage typeShipment  = typeShipments[_index];

        require(shipment.receiver == _receiver, "Invalid receiver");
        require(shipment.status == ShipmentStatus.PENDING, "Shipment already in transit");


        shipment.status  = ShipmentStatus.IN_TRANSIT;
        typeShipment.status = ShipmentStatus.IN_TRANSIT;

        emit ShipmentInTransit(_sender, _receiver, shipment.pickupTime);

    }


    function completShipment (address _sender, address _receiver, uint256 _index) public {
        //update status 

        Shipment storage shipment = shipments[_sender] [_index];
        TypeShipment storage typeShipment  = typeShipments[_index];

        require(shipment.receiver == _receiver, "Invalid receiver");
        require(shipment.status == ShipmentStatus.IN_TRANSIT, "Shipment Not in transit");

        require(!shipment.isPaid, "Shipment already Paid ");

        shipment.status  = ShipmentStatus.DELIVERED;
        typeShipment.status = ShipmentStatus.DELIVERED;
        typeShipment.deliveryTime = block.timestamp;
        shipment.deliveryTime = block.timestamp;
        
        uint256 amount = shipment.price;
        payable(shipment.sender). transfer(amount);

        shipment.isPaid = true;
        typeShipment.isPaid = true;
    

        emit ShipmentDelivered(_sender, _receiver, amount);
        emit ShipmentDelivered(_sender, _receiver, shipment.deliveryTime);

    }

    function getShipment  (address _sender, uint256 _index) public view returns ( 
        address, address, uint256, uint256, uint256,uint256, ShipmentStatus, bool) {

        Shipment memory shipment = shipments[_sender][_index];

        return(
            shipment.sender, 
            shipment.receiver,
            shipment.price,
            shipment.pickupTime,
            shipment.deliveryTime,
            shipment.distance,
            shipment.status,
            shipment.isPaid
           
            );

    }
    

    function getShipmentCount(address _sender) public view returns (uint256){
        return shipments[_sender].length;
    }



    function getAllTransactions() public view returns(TypeShipment[] memory) {
        return typeShipments;
    }
    
}

//0x5FbDB2315678afecb367f032d93F642f64180aa3