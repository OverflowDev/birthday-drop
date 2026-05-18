// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/BirthdayCard.sol";
import "../src/BirthdayDrop.sol";

contract Deploy is Script {
    // Arc Testnet stablecoin addresses
    address constant USDC = 0x3600000000000000000000000000000000000000;
    address constant EURC = 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        BirthdayCard birthdayCard = new BirthdayCard();
        console.log("BirthdayCard:", address(birthdayCard));

        address[] memory tokens = new address[](2);
        string[] memory symbols = new string[](2);
        tokens[0] = USDC;  symbols[0] = "USDC";
        tokens[1] = EURC;  symbols[1] = "EURC";

        BirthdayDrop birthdayDrop = new BirthdayDrop(address(birthdayCard), tokens, symbols);
        console.log("BirthdayDrop:", address(birthdayDrop));

        birthdayCard.setBirthdayDrop(address(birthdayDrop));
        console.log("BirthdayCard linked to BirthdayDrop");

        vm.stopBroadcast();
    }
}
