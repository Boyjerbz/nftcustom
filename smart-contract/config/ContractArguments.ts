import { utils } from 'ethers';
import CollectionConfig from './CollectionConfig';

// Update the following array if you change the constructor arguments...
const ContractArguments = [
  CollectionConfig.tokenName,
  CollectionConfig.tokenSymbol,
  utils.parseEther(CollectionConfig.publicSale.price.toString()), // Assuming this is the general cost
  utils.parseEther(CollectionConfig.whitelistSale.price.toString()), // Assuming this is the whitelist cost
  utils.parseEther(CollectionConfig.remiliaSale.price.toString()), // Remilio price
  CollectionConfig.maxSupply,
  CollectionConfig.publicSale.maxMintAmountPerTxPublic,
  CollectionConfig.remiliaSale.maxMintAmountPerTxRemilia,
  CollectionConfig.whitelistSale.maxMintAmountPerTxWhitelist,
  CollectionConfig.hiddenMetadataUri,
] as const;

export default ContractArguments;