const { expect } = require("chai");
const { ethers } = require("hardhat");
const { providers } = require("ethers");


describe("Test of Lottery contract", function () {
  let owner, acc1, acc2, acc3, acc4, lottery;

  beforeEach(async function() {
    [owner, acc1, acc2, acc3, acc4] = await ethers.getSigners();
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
    it("Owner cann't play", async function() {
      await expect(lottery.connect(owner).enter()).to.be.revertedWith("Owner cann't play")
  })

    it("should be exact 0.0001 ether to enter", async function() {
      await lottery.connect(acc1).enter({value: ethers.utils.parseEther("0.0001")});

      expect(await lottery.getBalance()).to.eq(ethers.utils.parseEther("0.0001"));
      
      await expect(lottery.connect(acc1).enter({value: ethers.utils.parseEther("0.0002")})).to.be.revertedWith("Should be exact 0.0001 ether")
  })
  
    it ("Only 3 players can play", async function() {
      await lottery.connect(acc1).enter({value: ethers.utils.parseEther("0.0001")});
      await lottery.connect(acc2).enter({value: ethers.utils.parseEther("0.0001")});
      await lottery.connect(acc3).enter({value: ethers.utils.parseEther("0.0001")});
      const qty = await lottery.getPlayers();

      expect(qty.length).to.eq(3);

      await expect (lottery.connect(acc4).enter({value: ethers.utils.parseEther("0.0001")})).to.be.revertedWith("Player limit reached or time is out")      
    })

  describe('PickWinner function', () => {  
    it("Only owner can pick a winner", async function() {       
      await expect(lottery.connect(acc1).pickWinner()).to.be.revertedWith("You are not the Owner")
  })

    it("should require quantity of players", async function(){            
      await expect (lottery.pickWinner()).to.be.revertedWith("Not enough players participating in a lottery or it's not yet time for the draw")
    })

    it("should check time is out", async function() {
      await expect (lottery.pickWinner()).to.be.revertedWith("Not enough players participating in a lottery or it's not yet time for the draw");
      
      const twoHours = 2 * 60 * 60;

      const blockNumBefore = await ethers.provider.getBlockNumber();
      const blockBefore = await ethers.provider.getBlock(blockNumBefore);
      const timestampBefore = blockBefore.timestamp;

      await ethers.provider.send('evm_increaseTime', [twoHours]);
      await ethers.provider.send('evm_mine');

      const blockNumAfter = await ethers.provider.getBlockNumber();

      const blockAfter = await ethers.provider.getBlock(blockNumAfter);
      const timestampAfter = blockAfter.timestamp;

      expect(blockNumAfter).to.be.equal(blockNumBefore + 1);
      expect(timestampAfter).to.be.equal(timestampBefore + twoHours);

      await expect (lottery.connect(acc2).enter({value: ethers.utils.parseEther("0.0001")})).to.be.revertedWith("Player limit reached or time is out");
      })


       
    it("Gainings should go 90% => Winner and 10% => owner", async function() {
      const balanceBefore = await ethers.provider.getBalance(lottery.address);
      console.log(balanceBefore);

      await lottery.connect(acc1).enter({value: ethers.utils.parseEther("0.0001")});
      await lottery.connect(acc2).enter({value: ethers.utils.parseEther("0.0001")});
      await lottery.connect(acc3).enter({value: ethers.utils.parseEther("0.0001")});

      const balanceIn = await ethers.provider.getBalance(lottery.address);
      console.log(balanceIn);

      expect(balanceIn).to.eq(ethers.utils.parseEther("0.0003"));

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

      let TX = await lottery.pickWinner();
      const receipt = await TX.wait();
      const gasUsed = BigInt(receipt.cumulativeGasUsed) * BigInt(receipt.effectiveGasPrice);

      const balanceAfter = await ethers.provider.getBalance(lottery.address);

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      console.log(balanceAfter);

      expect(ownerBalanceAfter.sub(ownerBalanceBefore).add(gasUsed)).to.eq(ethers.utils.parseEther("0.00003"))

      const balance = await lottery.getBalance();

      expect(balance).to.eq(0)
    })
  })
  })
})
