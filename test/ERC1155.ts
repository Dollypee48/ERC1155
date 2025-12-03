import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ERC1155Token } from "../typechain-types";

describe("ERC1155Token", function () {
  async function deployERC1155Fixture() {
    const [owner, account1, account2] = await ethers.getSigners();
    const baseURI = "https://example.com/api/token/";

    const ERC1155TokenFactory = await ethers.getContractFactory("ERC1155Token");
    const erc1155Token = await ERC1155TokenFactory.deploy(owner.address, baseURI);

    return { erc1155Token, owner, account1, account2, baseURI };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { erc1155Token, owner } = await loadFixture(deployERC1155Fixture);
      expect(await erc1155Token.owner()).to.equal(owner.address);
    });

    it("Should set the base URI", async function () {
      const { erc1155Token, baseURI } = await loadFixture(deployERC1155Fixture);
      expect(await erc1155Token.uri(1)).to.include(baseURI);
    });

    it("Should start with nextTokenId = 1", async function () {
      const { erc1155Token } = await loadFixture(deployERC1155Fixture);
      expect(await erc1155Token.nextTokenId()).to.equal(1);
    });
  });

  describe("Minting", function () {
    it("Should mint a single token with auto-increment ID", async function () {
      const { erc1155Token, owner, account1 } = await loadFixture(deployERC1155Fixture);
      const tokenURI = "ipfs://QmTest123/token-1.json";
      const amount = 10;

      await expect(erc1155Token.mint(account1.address, 0, amount, tokenURI))
        .to.emit(erc1155Token, "TokenMinted")
        .withArgs(account1.address, 1, amount, tokenURI);

      expect(await erc1155Token.balanceOf(account1.address, 1)).to.equal(amount);
      expect(await erc1155Token.uri(1)).to.equal(tokenURI);
      expect(await erc1155Token.nextTokenId()).to.equal(2);
    });

    it("Should mint a single token with specific ID", async function () {
      const { erc1155Token, owner, account1 } = await loadFixture(deployERC1155Fixture);
      const tokenId = 5;
      const tokenURI = "ipfs://QmTest123/token-5.json";
      const amount = 20;

      await erc1155Token.mint(account1.address, tokenId, amount, tokenURI);

      expect(await erc1155Token.balanceOf(account1.address, tokenId)).to.equal(amount);
      expect(await erc1155Token.uri(tokenId)).to.equal(tokenURI);
    });

    it("Should not allow minting with duplicate token ID", async function () {
      const { erc1155Token, owner, account1 } = await loadFixture(deployERC1155Fixture);
      const tokenId = 10;
      const tokenURI = "ipfs://QmTest123/token-10.json";

      await erc1155Token.mint(account1.address, tokenId, 10, tokenURI);

      await expect(
        erc1155Token.mint(account1.address, tokenId, 10, tokenURI)
      ).to.be.revertedWith("Token ID already exists");
    });

    it("Should only allow owner to mint", async function () {
      const { erc1155Token, account1 } = await loadFixture(deployERC1155Fixture);
      const tokenURI = "ipfs://QmTest123/token-1.json";

      await expect(
        erc1155Token.connect(account1).mint(account1.address, 1, 10, tokenURI)
      ).to.be.revertedWithCustomError(erc1155Token, "OwnableUnauthorizedAccount");
    });

    it("Should mint batch of tokens", async function () {
      const { erc1155Token, owner, account1 } = await loadFixture(deployERC1155Fixture);
      const tokenIds = [1, 2, 3];
      const amounts = [10, 20, 30];
      const uris = [
        "ipfs://QmTest123/token-1.json",
        "ipfs://QmTest123/token-2.json",
        "ipfs://QmTest123/token-3.json"
      ];

      await expect(erc1155Token.mintBatch(account1.address, tokenIds, amounts, uris))
        .to.emit(erc1155Token, "BatchMinted")
        .withArgs(account1.address, tokenIds, amounts);

      expect(await erc1155Token.balanceOf(account1.address, 1)).to.equal(10);
      expect(await erc1155Token.balanceOf(account1.address, 2)).to.equal(20);
      expect(await erc1155Token.balanceOf(account1.address, 3)).to.equal(30);

      expect(await erc1155Token.uri(1)).to.equal(uris[0]);
      expect(await erc1155Token.uri(2)).to.equal(uris[1]);
      expect(await erc1155Token.uri(3)).to.equal(uris[2]);
    });

    it("Should fail batch mint with mismatched array lengths", async function () {
      const { erc1155Token, owner, account1 } = await loadFixture(deployERC1155Fixture);
      const tokenIds = [1, 2];
      const amounts = [10, 20, 30];
      const uris = ["ipfs://QmTest123/token-1.json", "ipfs://QmTest123/token-2.json"];

      await expect(
        erc1155Token.mintBatch(account1.address, tokenIds, amounts, uris)
      ).to.be.revertedWith("Arrays length mismatch");
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const { erc1155Token, owner, account1, account2 } = await loadFixture(deployERC1155Fixture);
      const tokenId = 1;
      const mintAmount = 100;
      const transferAmount = 30;
      const tokenURI = "ipfs://QmTest123/token-1.json";

      await erc1155Token.mint(account1.address, tokenId, mintAmount, tokenURI);

      await erc1155Token.connect(account1).safeTransferFrom(
        account1.address,
        account2.address,
        tokenId,
        transferAmount,
        "0x"
      );

      expect(await erc1155Token.balanceOf(account1.address, tokenId)).to.equal(mintAmount - transferAmount);
      expect(await erc1155Token.balanceOf(account2.address, tokenId)).to.equal(transferAmount);
    });

    it("Should transfer batch of tokens", async function () {
      const { erc1155Token, owner, account1, account2 } = await loadFixture(deployERC1155Fixture);
      const tokenIds = [1, 2, 3];
      const amounts = [100, 200, 300];
      const transferAmounts = [10, 20, 30];
      const uris = [
        "ipfs://QmTest123/token-1.json",
        "ipfs://QmTest123/token-2.json",
        "ipfs://QmTest123/token-3.json"
      ];

      await erc1155Token.mintBatch(account1.address, tokenIds, amounts, uris);

      await erc1155Token.connect(account1).safeBatchTransferFrom(
        account1.address,
        account2.address,
        tokenIds,
        transferAmounts,
        "0x"
      );

      expect(await erc1155Token.balanceOf(account1.address, 1)).to.equal(90);
      expect(await erc1155Token.balanceOf(account1.address, 2)).to.equal(180);
      expect(await erc1155Token.balanceOf(account1.address, 3)).to.equal(270);

      expect(await erc1155Token.balanceOf(account2.address, 1)).to.equal(10);
      expect(await erc1155Token.balanceOf(account2.address, 2)).to.equal(20);
      expect(await erc1155Token.balanceOf(account2.address, 3)).to.equal(30);
    });

    it("Should fail transfer if insufficient balance", async function () {
      const { erc1155Token, owner, account1, account2 } = await loadFixture(deployERC1155Fixture);
      const tokenId = 1;
      const tokenURI = "ipfs://QmTest123/token-1.json";

      await erc1155Token.mint(account1.address, tokenId, 10, tokenURI);

      await expect(
        erc1155Token.connect(account1).safeTransferFrom(
          account1.address,
          account2.address,
          tokenId,
          100,
          "0x"
        )
      ).to.be.revertedWithCustomError(erc1155Token, "ERC1155InsufficientBalance");
    });
  });

  describe("Burning", function () {
    it("Should allow token owner to burn tokens", async function () {
      const { erc1155Token, owner, account1 } = await loadFixture(deployERC1155Fixture);
      const tokenId = 1;
      const mintAmount = 100;
      const burnAmount = 30;
      const tokenURI = "ipfs://QmTest123/token-1.json";

      await erc1155Token.mint(account1.address, tokenId, mintAmount, tokenURI);

      await erc1155Token.connect(account1).burn(account1.address, tokenId, burnAmount);

      expect(await erc1155Token.balanceOf(account1.address, tokenId)).to.equal(mintAmount - burnAmount);
    });

    it("Should allow batch burning", async function () {
      const { erc1155Token, owner, account1 } = await loadFixture(deployERC1155Fixture);
      const tokenIds = [1, 2, 3];
      const amounts = [100, 200, 300];
      const burnAmounts = [10, 20, 30];
      const uris = [
        "ipfs://QmTest123/token-1.json",
        "ipfs://QmTest123/token-2.json",
        "ipfs://QmTest123/token-3.json"
      ];

      await erc1155Token.mintBatch(account1.address, tokenIds, amounts, uris);

      await erc1155Token.connect(account1).burnBatch(account1.address, tokenIds, burnAmounts);

      expect(await erc1155Token.balanceOf(account1.address, 1)).to.equal(90);
      expect(await erc1155Token.balanceOf(account1.address, 2)).to.equal(180);
      expect(await erc1155Token.balanceOf(account1.address, 3)).to.equal(270);
    });
  });

  describe("URI Management", function () {
    it("Should return correct URI for minted token", async function () {
      const { erc1155Token, owner, account1 } = await loadFixture(deployERC1155Fixture);
      const tokenId = 1;
      const tokenURI = "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/token-1.json";

      await erc1155Token.mint(account1.address, tokenId, 10, tokenURI);

      expect(await erc1155Token.uri(tokenId)).to.equal(tokenURI);
    });

    it("Should allow different URIs for different tokens", async function () {
      const { erc1155Token, owner, account1 } = await loadFixture(deployERC1155Fixture);
      const tokenURI1 = "ipfs://QmTest123/token-1.json";
      const tokenURI2 = "ipfs://QmTest456/token-2.json";

      await erc1155Token.mint(account1.address, 1, 10, tokenURI1);
      await erc1155Token.mint(account1.address, 2, 10, tokenURI2);

      expect(await erc1155Token.uri(1)).to.equal(tokenURI1);
      expect(await erc1155Token.uri(2)).to.equal(tokenURI2);
    });
  });

  describe("Token ID Management", function () {
    it("Should auto-increment token IDs correctly", async function () {
      const { erc1155Token, owner, account1 } = await loadFixture(deployERC1155Fixture);
      const tokenURI = "ipfs://QmTest123/token.json";

      await erc1155Token.mint(account1.address, 0, 10, tokenURI);
      expect(await erc1155Token.nextTokenId()).to.equal(2);

      await erc1155Token.mint(account1.address, 0, 10, tokenURI);
      expect(await erc1155Token.nextTokenId()).to.equal(3);

      await erc1155Token.mint(account1.address, 0, 10, tokenURI);
      expect(await erc1155Token.nextTokenId()).to.equal(4);
    });

    it("Should track minted tokens correctly", async function () {
      const { erc1155Token, owner, account1 } = await loadFixture(deployERC1155Fixture);
      const tokenId = 5;
      const tokenURI = "ipfs://QmTest123/token.json";

      await erc1155Token.mint(account1.address, tokenId, 10, tokenURI);

      const balance = await erc1155Token.balanceOf(account1.address, tokenId);
      expect(balance).to.be.gt(0);
    });
  });

  describe("Approvals", function () {
    it("Should allow setting approval for all", async function () {
      const { erc1155Token, owner, account1, account2 } = await loadFixture(deployERC1155Fixture);
      const tokenId = 1;
      const tokenURI = "ipfs://QmTest123/token-1.json";

      await erc1155Token.mint(account1.address, tokenId, 100, tokenURI);

      await erc1155Token.connect(account1).setApprovalForAll(account2.address, true);

      expect(await erc1155Token.isApprovedForAll(account1.address, account2.address)).to.be.true;
    });

    it("Should allow approved operator to transfer tokens", async function () {
      const { erc1155Token, owner, account1, account2 } = await loadFixture(deployERC1155Fixture);
      const tokenId = 1;
      const tokenURI = "ipfs://QmTest123/token-1.json";

      await erc1155Token.mint(account1.address, tokenId, 100, tokenURI);
      await erc1155Token.connect(account1).setApprovalForAll(account2.address, true);

      await erc1155Token.connect(account2).safeTransferFrom(
        account1.address,
        account2.address,
        tokenId,
        50,
        "0x"
      );

      expect(await erc1155Token.balanceOf(account2.address, tokenId)).to.equal(50);
    });
  });
});

