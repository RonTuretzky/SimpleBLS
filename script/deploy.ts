import { ethers, upgrades } from "hardhat";
import { BigNumberish } from "ethers";
import { append as appendToEnv } from '../crypto/utils';
async function main() {
    const BLS = await ethers.getContractFactory("BLS");
    const BLSContract = await upgrades.deployProxy(BLS);
    await BLSContract.waitForDeployment();
    const address = await BLSContract.getAddress();
    console.log('Consumer deployed at address:', address);
    appendToEnv({ BLS_CONTRACT_ADDRESS: address }, '.env');
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
