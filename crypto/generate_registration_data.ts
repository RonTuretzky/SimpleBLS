import * as mcl from './mcl'
import { BigNumber, ethers } from 'ethers';
import * as dotenv from 'dotenv';
import ABIJSON from '../artifacts/contracts/BLS.sol/BLS.json';
dotenv.config();
import { append as appendToEnv } from './utils';


const abi = ABIJSON.abi;
const RPC_URL = process.env.RPC_URL || "";
const BLS_CONTRACT_ADDRESS = process.env.BLS_CONTRACT_ADDRESS || "";
const ECDSA_PRIVATE_KEY = process.env.ECDSA_PRIVATE_KEY || "";
const BLS_PRIVATE_KEY = process.env.BLS_PRIVATE_KEY || "";
if (RPC_URL == "" || BLS_CONTRACT_ADDRESS == "" || BLS_PRIVATE_KEY == "" || ECDSA_PRIVATE_KEY == "") {
    console.log("Please set the RPC_URL and BLS_CONTRACT_ADDRESS env variables");
    process.exit(1);
}
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(ECDSA_PRIVATE_KEY, provider);
const PUBLIC_KEY = wallet.address;
const BLSContract = new ethers.Contract(BLS_CONTRACT_ADDRESS, abi, wallet);

async function main() {
    // In order to sign an arbirtary message , you can use the following code snippet. You must initalize some domain that 
    // will constantly be signed as well , to prevent the signature from being used in a different context.

    //  const message = ethers.utils.solidityPack(
    // ["string", "address", "uint256"],
    // [someString.toLowerCase(), yourContractAddress.toLowerCase(), chainId]
    // const messagePoint = mcl.hashToPoint(message, domain);

    // This is what we use for the registration instead of any message 

    const messagePointRaw: any = await BLSContract.getPubkeyRegistrationMessagePoint(PUBLIC_KEY);
    const secret = BLS_PRIVATE_KEY
    await mcl.init();
    let secretkey = mcl.randFr()
    secretkey.setHashOf(secret);
    const signer = new mcl.BlsSigner(secretkey);
    const signature = signer.sign(messagePointRaw);
    const messagePoint = signature.messagePoint;
    const verifier = new mcl.BlsVerifier();
    const signatureg1: mcl.mclG1 = signature.sol
    const pubkey: mcl.mclG2 = signer.pubkey
    const verified = verifier.verify(signatureg1, pubkey, messagePoint);
    if (!verified) {
        console.log("Verification failed");
        process.exit(1);
    }
    const pubkeysol: mcl.mclG2 = signer.pubkeySol;
    const message_point_env = mcl.g1ToHex(messagePoint).map((x) => { return ethers.BigNumber.from(x).toString() });
    const signature_env = signatureg1.map((x: any) => { return ethers.BigNumber.from(x).toString() });
    const g2pubkey_env = pubkeysol.map((x: any) => { return ethers.BigNumber.from(x).toString() });
    const g1pubkey_env = mcl.g1ToHex(mcl.getG1Pubkey(secretkey)).map((x) => { return ethers.BigNumber.from(x).toString() });

    appendToEnv({
        MESSAGE_POINT_X0: message_point_env[0],
        MESSAGE_POINT_X1: message_point_env[1],
        SIGNATURE_X0: signature_env[0],
        SIGNATURE_X1: signature_env[1],
        G2_PUBKEY_X0: g2pubkey_env[0],
        G2_PUBKEY_X1: g2pubkey_env[1],
        G2_PUBKEY_Y0: g2pubkey_env[2],
        G2_PUBKEY_Y1: g2pubkey_env[3],
        G1_PUBKEY_X0: g1pubkey_env[0],
        G1_PUBKEY_X1: g1pubkey_env[1],
    }, ".env")


}

main().then(() => {
    process.exit(0);
}).catch((error) => {
    console.error(error);
    process.exit(1);
});