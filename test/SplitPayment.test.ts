import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SplitFactory, SplitBill } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SplitPay Smart Contract Suite", function () {
  let factory: SplitFactory;
  let creator: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let charlie: SignerWithAddress;
  let stranger: SignerWithAddress;

  const SPLIT_AMOUNT = ethers.parseEther("1.0"); // 1 MON
  const TITLE = "Dinner at Yellow Chilli";
  const DESCRIPTION = "Friday night team dinner split";
  const DEADLINE_HOURS = 24;

  beforeEach(async function () {
    [creator, alice, bob, charlie, stranger] = await ethers.getSigners();

    const SplitFactoryFactory = await ethers.getContractFactory("SplitFactory");
    factory = await SplitFactoryFactory.deploy();
    await factory.waitForDeployment();
  });

  describe("SplitFactory Deployment & Creation", function () {
    it("should deploy SplitFactory successfully", async function () {
      expect(await factory.getAddress()).to.properAddress;
      expect(await factory.getBillsCount()).to.equal(0);
    });

    it("should create a SplitBill and record mappings correctly", async function () {
      const participants = [alice.address, bob.address, charlie.address];

      const tx = await factory.connect(creator).createBill(
        TITLE,
        DESCRIPTION,
        participants,
        SPLIT_AMOUNT,
        DEADLINE_HOURS,
        { value: SPLIT_AMOUNT }
      );

      const receipt = await tx.wait();
      expect(await factory.getBillsCount()).to.equal(1);

      const creatorBills = await factory.getCreatorBills(creator.address);
      expect(creatorBills.length).to.equal(1);
      const billAddress = creatorBills[0];

      expect(await factory.isBill(billAddress)).to.be.true;

      const aliceBills = await factory.getParticipantBills(alice.address);
      expect(aliceBills).to.include(billAddress);

      const bobBills = await factory.getParticipantBills(bob.address);
      expect(bobBills).to.include(billAddress);

      const charlieBills = await factory.getParticipantBills(charlie.address);
      expect(charlieBills).to.include(billAddress);
    });

    it("should revert if creator does not pay share upfront", async function () {
      const participants = [alice.address, bob.address];
      await expect(
        factory.connect(creator).createBill(
          TITLE,
          DESCRIPTION,
          participants,
          SPLIT_AMOUNT,
          0,
          { value: ethers.parseEther("0.5") }
        )
      ).to.be.revertedWith("Must pay creator share upfront");
    });
  });

  describe("SplitBill Lifecycle & Settlement", function () {
    let bill: SplitBill;
    let billAddress: string;

    beforeEach(async function () {
      const participants = [alice.address, bob.address];
      const tx = await factory.connect(creator).createBill(
        TITLE,
        DESCRIPTION,
        participants,
        SPLIT_AMOUNT,
        DEADLINE_HOURS,
        { value: SPLIT_AMOUNT }
      );
      const receipt = await tx.wait();
      const creatorBills = await factory.getCreatorBills(creator.address);
      billAddress = creatorBills[0];
      bill = await ethers.getContractAt("SplitBill", billAddress);
    });

    it("should initialize bill details correctly", async function () {
      const details = await bill.getDetails();
      expect(details._creator).to.equal(creator.address);
      expect(details._billTitle).to.equal(TITLE);
      expect(details._billDescription).to.equal(DESCRIPTION);
      expect(details._splitAmount).to.equal(SPLIT_AMOUNT);
      expect(details._totalAmount).to.equal(ethers.parseEther("3.0")); // 3 people * 1 MON
      expect(details._totalParticipants).to.equal(3);
      expect(details._paidCount).to.equal(1); // Creator is paid
      expect(details._status).to.equal(0); // Open

      const [isCreatorMember, hasCreatorPaid] = await bill.getParticipantStatus(creator.address);
      expect(isCreatorMember).to.be.true;
      expect(hasCreatorPaid).to.be.true;

      const [isAliceMember, hasAlicePaid] = await bill.getParticipantStatus(alice.address);
      expect(isAliceMember).to.be.true;
      expect(hasAlicePaid).to.be.false;
    });

    it("should allow a participant to pay their exact share", async function () {
      await expect(
        bill.connect(alice).pay({ value: SPLIT_AMOUNT })
      ).to.emit(bill, "ParticipantPaid")
        .withArgs(alice.address, SPLIT_AMOUNT, 2, 1);

      const details = await bill.getDetails();
      expect(details._paidCount).to.equal(2);
      expect(details._status).to.equal(0); // Still Open
      expect(await bill.paid(alice.address)).to.be.true;
    });

    it("should allow dynamic open participant to pay their share even if not pre-invited", async function () {
      await expect(
        bill.connect(stranger).pay({ value: SPLIT_AMOUNT })
      ).to.emit(bill, "ParticipantPaid")
        .withArgs(stranger.address, SPLIT_AMOUNT, 2, 1);

      const details = await bill.getDetails();
      expect(details._paidCount).to.equal(2);
      expect(await bill.paid(stranger.address)).to.be.true;
      expect(await bill.isParticipant(stranger.address)).to.be.true;
    });

    it("should reject payments with incorrect amounts or after bill is fully filled", async function () {
      // Incorrect amount
      await expect(
        bill.connect(alice).pay({ value: ethers.parseEther("0.5") })
      ).to.be.revertedWith("Incorrect payment amount");

      // Pay once
      await bill.connect(alice).pay({ value: SPLIT_AMOUNT });

      // Double pay
      await expect(
        bill.connect(alice).pay({ value: SPLIT_AMOUNT })
      ).to.be.revertedWith("Already paid");

      // Bob pays (fills 3/3 slots)
      await bill.connect(bob).pay({ value: SPLIT_AMOUNT });

      // Stranger tries to pay when bill is already settled/filled
      await expect(
        bill.connect(stranger).pay({ value: SPLIT_AMOUNT })
      ).to.be.revertedWith("Bill is not open");
    });

    it("should settle bill automatically when all participants pay and allow creator withdrawal", async function () {
      // Alice pays
      await bill.connect(alice).pay({ value: SPLIT_AMOUNT });

      // Bob pays - triggers settlement
      await expect(
        bill.connect(bob).pay({ value: SPLIT_AMOUNT })
      ).to.emit(bill, "BillSettled")
        .withArgs(creator.address, ethers.parseEther("3.0"));

      const details = await bill.getDetails();
      expect(details._status).to.equal(1); // Settled
      expect(details._paidCount).to.equal(3);

      // Creator withdraws
      const creatorBalBefore = await ethers.provider.getBalance(creator.address);
      const withdrawTx = await bill.connect(creator).withdrawSettled();
      const receipt = await withdrawTx.wait();
      const gasSpent = receipt!.gasUsed * receipt!.gasPrice;

      const creatorBalAfter = await ethers.provider.getBalance(creator.address);
      expect(creatorBalAfter).to.equal(
        creatorBalBefore + ethers.parseEther("3.0") - gasSpent
      );

      // Cannot withdraw again
      await expect(
        bill.connect(creator).withdrawSettled()
      ).to.be.revertedWith("Funds already withdrawn");
    });

    it("should allow creator to cancel and participants to claim refunds", async function () {
      // Alice pays
      await bill.connect(alice).pay({ value: SPLIT_AMOUNT });

      // Creator cancels
      await expect(bill.connect(creator).cancelBill())
        .to.emit(bill, "BillCancelled")
        .withArgs(creator.address);

      const details = await bill.getDetails();
      expect(details._status).to.equal(2); // Cancelled

      // Alice claims refund
      const aliceBalBefore = await ethers.provider.getBalance(alice.address);
      const refundTx = await bill.connect(alice).claimRefund();
      const receipt = await refundTx.wait();
      const gasSpent = receipt!.gasUsed * receipt!.gasPrice;

      const aliceBalAfter = await ethers.provider.getBalance(alice.address);
      expect(aliceBalAfter).to.equal(
        aliceBalBefore + SPLIT_AMOUNT - gasSpent
      );

      // Cannot claim twice
      await expect(
        bill.connect(alice).claimRefund()
      ).to.be.revertedWith("Refund already claimed");

      // Creator claims refund
      await expect(bill.connect(creator).claimRefund())
        .to.emit(bill, "RefundClaimed")
        .withArgs(creator.address, SPLIT_AMOUNT);
    });

    it("should handle expiration when deadline passes and allow refunds", async function () {
      // Alice pays
      await bill.connect(alice).pay({ value: SPLIT_AMOUNT });

      // Fast forward past deadline (25 hours)
      await time.increase(25 * 3600);

      // Attempting to pay now fails because bill is expired
      await expect(
        bill.connect(bob).pay({ value: SPLIT_AMOUNT })
      ).to.be.revertedWith("Bill is not open");

      // Alice claims refund on expired bill
      await expect(bill.connect(alice).claimRefund())
        .to.emit(bill, "RefundClaimed")
        .withArgs(alice.address, SPLIT_AMOUNT);
    });
  });
});
