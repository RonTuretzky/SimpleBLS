import * as dotenv from 'dotenv';
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
import { ethers } from "hardhat";
import { BigNumberish } from "ethers";
interface G1PointStruct { X: BigNumberish, Y: BigNumberish };
interface G2PointStruct { X: [BigNumberish, BigNumberish], Y: [BigNumberish, BigNumberish] };
const MESSAGE_POINT_X0 = process.env.MESSAGE_POINT_X0 || "";
const MESSAGE_POINT_X1 = process.env.MESSAGE_POINT_X1 || "";
const SIGNATURE_X0 = process.env.SIGNATURE_X0 || "";
const SIGNATURE_X1 = process.env.SIGNATURE_X1 || "";
const G2_PUBKEY_X0 = process.env.G2_PUBKEY_X0 || "";
const G2_PUBKEY_X1 = process.env.G2_PUBKEY_X1 || "";
const G2_PUBKEY_Y0 = process.env.G2_PUBKEY_Y0 || "";
const G2_PUBKEY_Y1 = process.env.G2_PUBKEY_Y1 || "";
const G1_PUBKEY_X0 = process.env.G1_PUBKEY_X0 || "";
const G1_PUBKEY_X1 = process.env.G1_PUBKEY_X1 || "";
const ECDSA_PRIVATE_KEY = process.env.ECDSA_PRIVATE_KEY || "";
const BLS_CONTRACT_ADDRESS = process.env.BLS_CONTRACT_ADDRESS || "";

if (ECDSA_PRIVATE_KEY == "" || MESSAGE_POINT_X0 == "" || MESSAGE_POINT_X1 == "" || SIGNATURE_X0 == "" || SIGNATURE_X1 == "" || G2_PUBKEY_X0 == "" || G2_PUBKEY_X1 == "" || G2_PUBKEY_Y0 == "" || G2_PUBKEY_Y1 == "" || G1_PUBKEY_X0 == "" || G1_PUBKEY_X1 == "" || BLS_CONTRACT_ADDRESS == "") {
    console.log("Please set the PRIVATE_KEY and MESSAGE_POINT_X0 and MESSAGE_POINT_X1 and SIGNATURE_X0 and SIGNATURE_X1 and G2_PUBKEY_X0 and G2_PUBKEY_X1 and G2_PUBKEY_Y0 and G2_PUBKEY_Y1 and G1_PUBKEY_X0 and G1_PUBKEY_X1 env variables");
    process.exit(1);
}

async function main() {
    const BLS = await ethers.getContractFactory("BLS");
    const wallet = new ethers.Wallet(ECDSA_PRIVATE_KEY, ethers.provider);
    const BLSContract = new ethers.Contract("0xD29a2484C1D0EE935A1c4d197b20206dd8a8101C", BLS.interface, wallet);

    const msgpoint: G1PointStruct = { X: MESSAGE_POINT_X0, Y: MESSAGE_POINT_X1 };
    const apkg1: G1PointStruct = { X: G1_PUBKEY_X0, Y: G1_PUBKEY_X1 };
    const apkg2: G2PointStruct = { X: [G2_PUBKEY_X0, G2_PUBKEY_X1], Y: [G2_PUBKEY_Y0, G2_PUBKEY_Y1] };
    const sig: G1PointStruct = { X: SIGNATURE_X0, Y: SIGNATURE_X1 };

    const tx = await BLSContract.registerUser({ ...sig }, { ...msgpoint }, { ...apkg1 }, { ...apkg2 });
    const res = await tx.wait();
    console.log(res);

}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
