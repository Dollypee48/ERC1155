# IPFS Metadata Files

This directory contains JSON metadata files for ERC1155 tokens. These files follow the ERC1155 Metadata JSON Schema.

## Structure

Each metadata file should be uploaded to IPFS and the IPFS hash/URI should be used when minting tokens.

## Current Metadata Files

Your metadata files are ready with IPFS image CIDs:
- **token-1.json**: NFT ONE - Image CID: `bafybeidvkdbwkiomycefc4mr6uf7uz4v7gakaqjrcawdahdlt3yqztxg54`
- **token-2.json**: NFT TWO - Image CID: `bafybeifxfmc73olqmawucc4x55ehrozk6q637yewsu7ilrotogmfil5hxe`
- **token-3.json**: NFT THREE - Image CID: `bafybeicmmvw6gwlv62lt2kqjaf5slreiso4erecoj7aohlerh64dhr6pre`

## Next Steps

1. Upload these JSON files to IPFS to get metadata CIDs
2. Use the metadata CIDs when minting tokens

## Example IPFS URIs

After uploading to IPFS, your metadata URIs will look like:
- `ipfs://YOUR_METADATA_CID_1/token-1.json`
- `ipfs://YOUR_METADATA_CID_2/token-2.json`
- `ipfs://YOUR_METADATA_CID_3/token-3.json`

## Uploading to IPFS

You can use services like:
- Pinata (https://pinata.cloud)
- IPFS Desktop
- Web3.Storage
- NFT.Storage

Or use the IPFS CLI:
```bash
ipfs add metadata/token-1.json
```

## Metadata Schema

Each JSON file contains:
- `name`: Token name
- `description`: Token description
- `image`: IPFS URI to the token image
- `attributes`: Array of trait objects
- `external_url`: Optional external URL

