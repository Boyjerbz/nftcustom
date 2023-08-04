import CollectionConfigInterface from '../lib/CollectionConfigInterface';
import * as Networks from '../lib/Networks';
import * as Marketplaces from '../lib/Marketplaces';
import whitelistAddresses from './whitelist.json';
import remilialistAddresses from './remilialist.json';

const CollectionConfig: CollectionConfigInterface = {
  testnet: Networks.ethereumTestnet,
  mainnet: Networks.ethereumMainnet,
  // The contract name can be updated using the following command:
  // yarn rename-contract NEW_CONTRACT_NAME
  // Please DO NOT change it manually!
  contractName: 'Loverboy',
  tokenName: 'Loverboy',
  tokenSymbol: 'LOVE',
  hiddenMetadataUri: 'ipfs://__CID__/hidden.json',
  maxSupply: 5000,
  whitelistSale: {
    price: 0,
    maxMintAmountPerTxWhitelist: 3,
    maxMintAmountPerTxRemilia: 0,
    maxMintAmountPerTxPublic: 0
  },
  remiliaSale: {
    price: 0.025,
    maxMintAmountPerTxRemilia: 10,
    maxMintAmountPerTxWhitelist: 0,
    maxMintAmountPerTxPublic: 0
  },
  publicSale: {
    price: 0.045,
    maxMintAmountPerTxPublic: 20,
    maxMintAmountPerTxWhitelist: 0,
    maxMintAmountPerTxRemilia: 0
  },
  contractAddress: "0xC0DdE3A4BC7Ff59ba6117f6Ae30841E904A64a29",
  marketplaceIdentifier: 'loverboy',
  marketplaceConfig: Marketplaces.openSea,
  whitelistAddresses,
  remilialistAddresses,
};

export default CollectionConfig;
