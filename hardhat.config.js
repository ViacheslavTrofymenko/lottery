require("@nomiclabs/hardhat-waffle");
require('solidity-coverage');
require('dotenv').config();
require('@openzeppelin/hardhat-upgrades');

const { API_URL, PRIVATE_KEY } = process.env;

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});


module.exports = {
  solidity: "0.8.4",
   networks: {
      hardhat: {},
      ropsten: {
         url: API_URL,
         accounts: [`0x${PRIVATE_KEY}`]
      }
   },
};
