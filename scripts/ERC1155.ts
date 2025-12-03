import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const contractAddress = "0x9d9e0310b65DE1c4e5b25Fa665d24d11787f0e8a";
  
  console.log("Contract Address:", contractAddress);
  console.log("Network: Sepolia\n");

  const signers = await ethers.getSigners();
  const owner = signers[0];
  console.log("Owner Address:", owner.address);

  const ContractFactory = await ethers.getContractFactory("ERC1155Token");
  const contract = ContractFactory.attach(contractAddress);

  const token1URI = "ipfs://bafkreieqmx5nmzcbbagyshent66tr4ufu7f3exthzvecsgise7hudihe3u/token-1.json";
  const token2URI = "ipfs://bafkreicjtfppdnkvequeqado7axss4bo4bz365znux2wnsef3ro2cgpmue/token-2.json";
  const token3URI = "ipfs://bafkreicfvnzp4ykukfkfa3ti5gmmjntf5amdiokar47pbodblptiyqf5de/token-3.json";

  try {
    console.log("\n--- Checking Existing Tokens ---");
    const existingBalance1 = await contract.balanceOf(owner.address, 1);
    const existingBalance2 = await contract.balanceOf(owner.address, 2);
    const existingBalance3 = await contract.balanceOf(owner.address, 3);
    
    console.log("\n--- Minting Tokens ---");
    
    if (existingBalance1.toString() === "0") {
      console.log("Minting Token 1 (NFT ONE)...");
      const tx1 = await contract.mint(owner.address, 0, 100, token1URI);
      console.log("Transaction Hash:", tx1.hash);
      await tx1.wait();
      console.log("Token 1 minted successfully");
    } else {
      console.log("Token 1 already exists, skipping mint");
    }

    if (existingBalance2.toString() === "0") {
      console.log("\nMinting Token 2 (NFT TWO)...");
      const tx2 = await contract.mint(owner.address, 0, 50, token2URI);
      console.log("Transaction Hash:", tx2.hash);
      await tx2.wait();
      console.log("Token 2 minted successfully");
    } else {
      console.log("Token 2 already exists, skipping mint");
    }

    if (existingBalance3.toString() === "0") {
      console.log("\nMinting Token 3 (NFT THREE)...");
      const tx3 = await contract.mint(owner.address, 0, 75, token3URI);
      console.log("Transaction Hash:", tx3.hash);
      await tx3.wait();
      console.log("Token 3 minted successfully");
    } else {
      console.log("Token 3 already exists, skipping mint");
    }

    console.log("\n--- Token Balances ---");
    const balance1 = await contract.balanceOf(owner.address, 1);
    const balance2 = await contract.balanceOf(owner.address, 2);
    const balance3 = await contract.balanceOf(owner.address, 3);
    
    console.log("Token 1 (NFT ONE):", balance1.toString());
    console.log("Token 2 (NFT TWO):", balance2.toString());
    console.log("Token 3 (NFT THREE):", balance3.toString());

    console.log("\n--- Token URIs ---");
    const uri1 = await contract.uri(1);
    const uri2 = await contract.uri(2);
    const uri3 = await contract.uri(3);
    console.log("Token 1 URI:", uri1);
    console.log("Token 2 URI:", uri2);
    console.log("Token 3 URI:", uri3);

    console.log("\n--- Transferring Tokens ---");
    const recipientAddress = "0x7e6a38d86e4a655086218c1648999e509b40e391";
    console.log("Transferring 2 tokens of ID 1 to:", recipientAddress);
    const transferTx = await contract.safeTransferFrom(
      owner.address,
      recipientAddress,
      1,
      2,
      "0x"
    );
    console.log("Transaction Hash:", transferTx.hash);
    await transferTx.wait();
    console.log("Transfer completed successfully");

    const recipientBalance = await contract.balanceOf(recipientAddress, 1);
    console.log("Recipient now has", recipientBalance.toString(), "of token 1");

    console.log("\n--- Summary ---");
    console.log("All tokens minted and transferred successfully!");
    console.log("View on Etherscan: https://sepolia.etherscan.io/address/" + contractAddress);

  } catch (error: any) {
    console.log("\nError occurred:");
    if (error.reason) {
      console.log("Reason:", error.reason);
    } else if (error.message) {
      console.log("Message:", error.message);
    } else {
      console.log(error);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log("Fatal error:", error);
    process.exit(1);
  });
