const { inputToConfig } = require("@ethereum-waffle/compiler");
const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("Test of Lottery contract", function () {
  let owner, acc1, acc2, acc3, lottery;

  beforeEach(async function() {
    [owner, acc1, acc2, acc3] = await ethers.getSigners();
    const Lottery = await ethers.getContractFactory("Lottery", owner);
    lottery = await Lottery.deploy();
    await lottery.deployed();        
  })

  describe('Deployement', () => {
    it('Should set the right owner', async() => {
      expect(await lottery.owner()).to.equal(owner.address);
    })

    it("should be deployed", async function() {
      expect(lottery.address).to.be.properAddress;
    })

    it("should have 0 ether by default", async function() {
      const balance = await lottery.getBalance();
      expect(balance).to.eq(0)
    })
  })

  describe('Enter function', () => {    
    it("should be exact 0.1 ether to enter", async function() {
      const sum = ethers.utils.parseEther("0.1");
      acc1.balance = ethers.utils.parseEther("0.1");
      expect(acc1.balance).to.eq(sum);
    })

    it("Owner cann't play", async function() {      
    //   await expect(lottery.connect(owner).enter()).to.be.revertedWith("Sorry, you are owner")      
    // })
  })

  // function delay(ms) {
  //   return new Promise(resolve => setTimeout(resolve, ms))
  // }

  describe('PickWinner function', () => {  
    it("Only owner can pick a winner", async function() {
    //   this.timeout(15000) //15s  
    // await delay(11000)
    await expect(lottery.connect(acc1).pickWinner()).to.be.revertedWith("Only owner can pick winner")
  })
     
    it("Gainings should go 90% => Winner and 10% => owner", async function() {
    })    
  })
})
