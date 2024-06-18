import * as dotenv from 'dotenv';
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades"
const ECDSA_PRIVATE_KEY = process.env.ECDSA_PRIVATE_KEY || "";
const RPC_URL = process.env.RPC_URL || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    holesky: {
      url: RPC_URL,
      accounts: [ECDSA_PRIVATE_KEY]
    },
  },
  etherscan: {
    apiKey: {
      holesky: ETHERSCAN_API_KEY
    }
  }
};

export default config;
