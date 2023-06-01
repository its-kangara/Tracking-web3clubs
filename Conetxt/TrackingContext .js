import React, {useState, useEffect, useContext} from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

//Importing the ABI
import tracking from "../Conetxt/Tracking.json";
import { accessListify } from "ethers/lib/utils";


//address contract
const ContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ContractABI = tracking.abi;

// function to fetching smart contract - to interact with it
const fetchContract = (signerORProvider) =>
  new ethers.Contract(ContractAddress, ContractABI, signerORProvider);

//using context management to manage out entire application SC
export const TrackingContext = React.createContext();
export const TrackingProvider = ({ children }) => {
  //state variables

  const DappName = "Product Tracking DAPP";
  const DappVersion = "0.0.1";
  const [currentUser, setCurrentUser] = useState("");

  //creating shipment
  const createShipment = async (items) => {
    console.log(items);
    const { receiver, pickupTime, distance, price } = items; //items - data needed to create shipping from our contract

    try {
      //connection
      const web3modal = new Web3Modal();
      const connection = await web3modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer); // creates a reference for the user interacting with our contract
      const createItem = await contract.createShipment(
        receiver,
        new Date(pickupTime).getTime(), //convert time in timestamp
        distance,
        ethers.utils.parseUnits(price, 18), //conv price in ether 18 decimal points

        {
          value: ethers.utils.parseUnits(price, 18), // pass price in
        }
      );

      await createItem.wait(); // wait for transaction to be written in the blockchain.
      console.log(createItem);
    } catch (error) {
      console.log("Something went wrong when creating the shipment", error);
    }
  };

  // Getting all shipments in our App

  const getAllShipment = async () => {
    try {
      //the "get" connection is  diffrent since we are not making any changes in the blockchain ... just fetching/retrieve data
      const provider = new ethers.providers.JsonRpcProvider();
      const contract = fetchContract(provider);

      const shipments = await contract.getAllTransactions();
      const allShipments = shipments.map((shipment) => ({
        sender: shipment.sender,
        receiver: shipment.receiver,
        price: ethers.utils.formatEther(shipment.price.toString()),
        pickupTime: shipment.pickupTime.toNumber(),
        distance: shipment.distance.toNumber(),
        status: shipment.status,
        ispaid: shipment.ispaid,
      }));

      return allShipments;
    } catch (error) {
      console.log("error want, getting shipment");
    }
  };

  const getAllShipmentCount = async () => {
    try {
      if (window.ethereum) return "install Metamask";

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      const provider = new ethers.providers.JsonRpcProvider();
      const contract = fetchContract(provider);

      const shipments = await contract.getAllShipmentCount(accounts[0]);
      return shipmentsCount.toNumber();
    } catch (error) {
      console.log("error want, getting shipment");
    }
  };


  const completeShipment = async(compleShip) => {
    console.log(completeShip);

    const { receiver, index } = compleShip;
    try{
        if (!window.ethereum) return "install Metamask";

        const account = await window.ethereum.request({
            method: "eth_accounts",
        });

        const web3modal = new Web3Modal();
        const connection = await web3modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);

        const transaction = await contract.completeShipment(
            accounts[0],
            receiver,
            Index,
            {
                gasLimit: 300000,
            }
        );

        transaction.await();
        console.log(transaction);
        } catch (error) {
            console.log ("wrong complete shipment", error);
 
    
    }
  };

  const getShipment = async(index) => {
    console.log(index*1);

    try{
        if (!window.ethereum) return "install Metamask";

        const account = await window.ethereum.request({
            method: "eth_accounts",
            });

        const provider = new ethers.providers.JsonRpcProvider();
        const contract = fetchContract(provider);
        const shipment = await contract.getShipment(account[0], index * 1);

        const SingleShipment = {
            sender: shipment[0],
            receiver: shipment[1],
            pickupTime:shipment[2].toNumber(),
            deliveryTime: shipment[3].toNumber(),
            distance:shipment[4].toNumber(),
            price: ethers.utils.formatEther(shipment[5]. toString()),
            status: shipment[6],
            isPaid: shipment[7],
        };
        return SingleShipment;
    }
    catch(error){console.log("sorry no shipment");
        
    }
  }



  const startShipment =  async(getProduct) => {
    const {receiver, index} = getProduct;

    try {
        if (!window.ethereum) return "install Metamask";

        const accounts = await window.ethereum.request({
            method: "eth_accounts",
        });

         //connection
      const web3modal = new Web3Modal();
      const connection = await web3modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer); // creates a reference for the user interacting with our contract
      const createItem = await contract.startShipment(
        accounts[0],
        receiver,
        index * 1

      );

      shipment.await();
      console.log(shipment);
      } catch(error) {
        console.log("Sorry bo shipment", error);
      }
    };


    //check if there is a Connection to metamask 
    const checkIfWalletConnected = async () => {
        try {
            if (!window.ethereum) 
            return "install Metamask";
            const accounts = await window.ethereum.request({
                method: "eth_accounts",
            })

            if (accounts.length) {  // if account are moree than 1 then set the first as default 
                setCurrentUser(account [0]);

            }else {
                return "No acccount ";

            }
            } catch(error) {
                return "Not Connected  ";
    }
};


//conet to wallet onclick function buttton 


const  connectWallet = async() => {
    try{
        if (!window.ethereum) return "install Metamask";

        const acccount = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        setCurrentUser[account[0]];
        } catch(error) {
            return "something went wrong";

    }
};

//this function will be checked every time a user visits out website
useEffect(() => {
    checkIfWalletConnected();
},[]);



return(

    <TrackingContext.Provider

    value={{
        connectWallet,
        createShipment,
        getAllShipment,
        completeShipment,
        getShipment,
        startShipment,
        getShipmentsCount,
        DappName,
        currentUser,

    }}> {children}</TrackingContext.Provider>
);
};






