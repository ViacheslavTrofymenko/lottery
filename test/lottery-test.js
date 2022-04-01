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
    console.log(lottery.address)
  })

  describe('Deployement', () => {
    it('Should set the right owner', async() => {
      expect(await lottery.owner()).to.equal(owner.address);
    })

    it("should be deployed", async function() {
      expect(lottery.address).to.be.properAddress;
    })
  })


  
  describe('Lottery contract', () => {
    it("should have 0 ether by default", async function() {
      const balance = await lottery.getBalance();
      expect(balance).to.eq(0)
    })

    it("should be exact 0.1 ether to enter", async function() {

    })

    it("Owner cann't play", async function() {

    })

    it("Only owner can pick a winner", async function() {

    })

    it("Calculating ether before and after pickWinner", async function() {

    })

    it("should 90% => Winner and 10% => owner", async function() {

    })
  })  
})