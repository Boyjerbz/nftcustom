import NetworkConfigInterface from '../lib/NetworkConfigInterface';
import MarketplaceConfigInterface from '../lib/MarketplaceConfigInterface';

interface SaleConfig {
  price: number;
  maxMintAmountPerTxWhitelist: number;
  maxMintAmountPerTxRemilia: number;
  maxMintAmountPerTxPublic: number;
};

export default interface CollectionConfigInterface {
  testnet: NetworkConfigInterface;
  mainnet: NetworkConfigInterface;
  contractName: string;
  tokenName: string;
  tokenSymbol: string;
  hiddenMetadataUri: string;
  maxSupply: number;
  whitelistSale: SaleConfig;
  remiliaSale: SaleConfig;
  publicSale: SaleConfig;
  contractAddress: string|null;
  marketplaceIdentifier: string;
  marketplaceConfig: MarketplaceConfigInterface;
  whitelistAddresses: string[];
  remilialistAddresses: string[];
};
