// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";

contract ERC1155Token is ERC1155, Ownable, ERC1155URIStorage, ERC1155Burnable {
    uint256 private _nextTokenId = 1;

    mapping(uint256 => bool) private _mintedTokens;

    event TokenMinted(address indexed to, uint256 indexed tokenId, uint256 amount, string uri);
    event BatchMinted(address indexed to, uint256[] tokenIds, uint256[] amounts);

    constructor(
        address initialOwner,
        string memory baseURI_
    ) ERC1155(baseURI_) Ownable(initialOwner) {
    }

    function mint(
        address to,
        uint256 tokenId,
        uint256 amount,
        string memory tokenURI
    ) public onlyOwner {
        if (tokenId == 0) {
            tokenId = _nextTokenId;
            _nextTokenId++;
        } else {
            require(!_mintedTokens[tokenId], "Token ID already exists");
            _mintedTokens[tokenId] = true;
        }

        _mint(to, tokenId, amount, "");
        _setURI(tokenId, tokenURI);
        
        emit TokenMinted(to, tokenId, amount, tokenURI);
    }

    function mintBatch(
        address to,
        uint256[] memory tokenIds,
        uint256[] memory amounts,
        string[] memory uris
    ) public onlyOwner {
        require(
            tokenIds.length == amounts.length && tokenIds.length == uris.length,
            "Arrays length mismatch"
        );

        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (tokenIds[i] == 0) {
                tokenIds[i] = _nextTokenId;
                _nextTokenId++;
            } else {
                require(!_mintedTokens[tokenIds[i]], "Token ID already exists");
                _mintedTokens[tokenIds[i]] = true;
            }
        }

        _mintBatch(to, tokenIds, amounts, "");

        for (uint256 i = 0; i < tokenIds.length; i++) {
            _setURI(tokenIds[i], uris[i]);
        }

        emit BatchMinted(to, tokenIds, amounts);
    }

    function nextTokenId() public view returns (uint256) {
        return _nextTokenId;
    }

    function isTokenMinted(uint256 tokenId) public view returns (bool) {
        return _mintedTokens[tokenId] || balanceOf(msg.sender, tokenId) > 0;
    }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155) {
        super._update(from, to, ids, values);
    }

    function uri(uint256 tokenId) public view override(ERC1155, ERC1155URIStorage) returns (string memory) {
        return ERC1155URIStorage.uri(tokenId);
    }
}
