import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ERC1155Module = buildModule("ERC1155Module", (m) => {
  const deployer = m.getAccount(0);
  
  const baseURI = m.getParameter(
    "baseURI",
    "https://ipfs.io/ipfs/"
  );

  const erc1155Token = m.contract("ERC1155Token", [deployer, baseURI]);

  return { erc1155Token };
});

export default ERC1155Module;

