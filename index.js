import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";
import { abi, contractaddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const getBalance = document.getElementById("getbalance");
const withdrawbutton = document.getElementById("withdraw");
connectButton.onclick = connect;
fundButton.onclick = fund;
getBalance.onclick = getbalance;
withdrawbutton.onclick = withdraw;

async function connect() {
  try {
    if (window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      connectButton.innerHTML = "Connected";
    } else {
      connectButton.innerHTML = "Please install metamask";
    }
  } catch (error) {
    console.log(error);
  }
}

async function getbalance() {
  try {
    if (window.ethereum) {
      const provider = await new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(contractaddress);
      console.log(`${ethers.formatEther(balance)}`);
    } else {
      connectButton.innerHTML = "Please install metamask";
    }
  } catch (error) {
    console.log(error);
  }
}

async function fund() {
  const ethamount = document.getElementById("ethamount").value;
  console.log(`funding contract with ${ethamount}`);
  const provider = await new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = await new ethers.Contract(contractaddress, abi, signer);
  try {
    const feeData = await provider.getFeeData();
    const maxFeePerGas = feeData.maxFeePerGas * BigInt("2"); // Set to twice the suggested maxFeePerGas
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;

    const tx1 = await contract.fund({
      value: ethers.parseEther(ethamount),
      maxFeePerGas: maxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
    });
    await listenfortxcompletion(provider, tx1);
    console.log("DONE !");
  } catch (error) {
    console.log(error);
  }
}

function listenfortxcompletion(provider, transactionResponse) {
  console.log(`Mining at ${transactionResponse.hash}`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, async (transactionReceipt) => {
      console.log(
        `Done with ${await transactionReceipt.confirmations()} confirmations`
      );
      resolve();
    });
  });
}

async function withdraw() {
  console.log(`Withdrawing.....`);
  const provider = await new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = await new ethers.Contract(contractaddress, abi, signer);
  try {
    const feeData = await provider.getFeeData();
    const maxFeePerGas = feeData.maxFeePerGas * BigInt("2"); // Set to twice the suggested maxFeePerGas
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;

    const tx1 = await contract.withdraw({
      maxFeePerGas: maxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
    });
    await listenfortxcompletion(provider, tx1);
    console.log("DONE !");
  } catch (error) {
    console.log(error);
  }
}
