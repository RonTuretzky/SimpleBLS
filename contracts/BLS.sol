//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;
import {BN254} from "./BN254.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {BN256G2} from "./BN256G2.sol";
contract BLS is OwnableUpgradeable {
    using BN254 for BN254.G1Point;
    using BN256G2 for *;
    uint256 internal constant PAIRING_EQUALITY_CHECK_GAS = 120_000;
    bytes32 internal constant ZERO_PK_HASH =
        hex"ad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb5";
    bytes32 public constant DOMAIN = keccak256("YOUR_APP_NAME");

    struct PublicKeys {
        BN254.G1Point pubkeyG1;
        BN254.G2Point pubkeyG2;
    }
    struct ApkUpdate {
        // first 24 bytes of keccak256(apk_x0, apk_x1, apk_y0, apk_y1)
        bytes24 apkHash;
        // block number at which the update occurred
        uint32 updateBlockNumber;
        // block number at which the next update occurred
        uint32 nextUpdateBlockNumber;
    }
    /// @notice maps operator address to pubkeys
    mapping(address => PublicKeys) public publicKeys;
    mapping(bytes32 => address) public pubkeyHashToAddress;
    /// @notice maps quorumNumber => current aggregate pubkey of quorum
    BN254.G1Point public currentG1Apk;
    BN254.G2Point private currentG2Apk;
    error ZeroPubkey();
    error AlreadyRegistered();
    function initialize() external initializer {
        __Ownable_init(msg.sender);
    }
    function registerUser(
        BN254.G1Point calldata pubkeyRegistrationSignature,
        BN254.G1Point calldata pubkeyRegistrationMessagePoint,
        BN254.G1Point calldata pubkeyG1,
        BN254.G2Point calldata pubkeyG2
    ) public {
        bytes32 pubkeyHash = BN254.hashG1Point(pubkeyG1);
        if (pubkeyHash == ZERO_PK_HASH) {
            revert ZeroPubkey();
        }
        if (
            publicKeys[msg.sender].pubkeyG1.X != 0 ||
            pubkeyHashToAddress[pubkeyHash] != address(0)
        ) revert AlreadyRegistered();
        verifySignature(
            pubkeyRegistrationMessagePoint,
            pubkeyG1,
            pubkeyG2,
            pubkeyRegistrationSignature
        );
        PublicKeys memory _publicKeys = PublicKeys(pubkeyG1, pubkeyG2);
        publicKeys[msg.sender] = _publicKeys;
        currentG1Apk = currentG1Apk.plus(pubkeyG1);
        uint256[4] memory aggPubkey;
        (aggPubkey[0], aggPubkey[1], aggPubkey[2], aggPubkey[3]) = BN256G2
            .ecTwistAdd(
                currentG2Apk.X[1],
                currentG2Apk.X[0],
                currentG2Apk.Y[1],
                currentG2Apk.Y[0],
                pubkeyG2.X[1],
                pubkeyG2.X[0],
                pubkeyG2.Y[1],
                pubkeyG2.Y[0]
            );
        currentG2Apk = BN254.G2Point(
            [aggPubkey[1], aggPubkey[0]],
            [aggPubkey[3], aggPubkey[2]]
        );
    }
    
    function verifySignature(
        BN254.G1Point memory msgPoint,
        BN254.G1Point memory apk,
        BN254.G2Point memory apkG2,
        BN254.G1Point memory sigma
    ) public view returns (bool validSignature) {
        (bool pairingSuccessful, bool siganatureIsValid) = BN254
            .trySignatureAndApkVerification(msgPoint, apk, apkG2, sigma);
        return pairingSuccessful && siganatureIsValid;
    }

    function getCurrentG2Apk() public view returns (BN254.G2Point memory) {
        return currentG2Apk;
    }
    function getPubkeyRegistrationMessagePoint(
        address signer
    ) external view returns (BN254.G1Point memory) {
        // slither-disable-next-line calls-loop
        return
            BN254.hashToG1(
                keccak256(
                    abi.encodePacked(
                        DOMAIN,
                        signer,
                        address(this),
                        block.chainid
                    )
                )
            );
    }
}
