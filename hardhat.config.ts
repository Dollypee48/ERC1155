import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { vars } from "hardhat/config";

const PRIVATE_KEY = vars.has("PRIVATE_KEY") ? vars.get("PRIVATE_KEY") : "";
const ALCHEMY_API_KEY = vars.has("ALCHEMY_API_KEY") ? vars.get("ALCHEMY_API_KEY") : "";
const ETHERSCAN_API_KEY = vars.has("ETHERSCAN_API_KEY") ? vars.get("ETHERSCAN_API_KEY") : "";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: ALCHEMY_API_KEY 
        ? `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
        : "https://rpc.sepolia.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    celoSepolia: {
      url: ALCHEMY_API_KEY
        ? `https://celo-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
        : "https://alfajores-forno.celo-testnet.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 44787,
    },
    baseSepolia: {
      url: ALCHEMY_API_KEY
        ? `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
        : "https://sepolia.base.org",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 84532,
    },
  },
  etherscan: ETHERSCAN_API_KEY
    ? {
        apiKey: ETHERSCAN_API_KEY,
        customChains: [
          {
            network: "sepolia",
            chainId: 11155111,
            urls: {
              apiURL: "https://api-sepolia.etherscan.io/api",
              browserURL: "https://sepolia.etherscan.io",
            },
          },
          {
            network: "celoSepolia",
            chainId: 44787,
            urls: {
              apiURL: "https://api-alfajores.celoscan.io/api",
              browserURL: "https://alfajores.celoscan.io",
            },
          },
          {
            network: "baseSepolia",
            chainId: 84532,
            urls: {
              apiURL: "https://api-sepolia.basescan.org/api",
              browserURL: "https://sepolia.basescan.org",
            },
          },
        ],
      }
    : undefined,
};

export default config;