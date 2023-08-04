import { utils } from 'ethers';
import CollectionConfig from './../config/CollectionConfig';
import NftContractProvider from '../lib/NftContractProvider';

async function main() {
  // Check configuration
  if (CollectionConfig.whitelistAddresses.length < 1) {
    throw '\x1b[31merror\x1b[0m ' + 'The whitelist is empty, please add some addresses to the configuration.';
  }

  if (CollectionConfig.remilialistAddresses.length < 1) {
    throw '\x1b[31merror\x1b[0m ' + 'The whitelist is empty, please add some addresses to the configuration.';
  }
  
  // Attach to deployed contract
  const contract = await NftContractProvider.getContract();

  

  // Update max amount per TX (if needed)
  if (!await (await contract.maxMintAmountPerTxWhitelist()).eq(CollectionConfig.whitelistSale.maxMintAmountPerTxWhitelist)) {
    console.log(`Updating the max mint amount per TX to ${CollectionConfig.whitelistSale.maxMintAmountPerTxWhitelist}...`);

    await (await contract.setMaxMintAmountPerTxWhitelist(CollectionConfig.whitelistSale.maxMintAmountPerTxWhitelist)).wait();
  }

  // Add whitelist addresses
  console.log(`Adding ${CollectionConfig.whitelistAddresses.length} addresses to the whitelist...`);
  await (await contract.addToWhitelist(CollectionConfig.whitelistAddresses)).wait();

  console.log(`Adding ${CollectionConfig.remilialistAddresses.length} addresses to the remilialist...`);
  await (await contract.addToRemilialist(CollectionConfig.remilialistAddresses)).wait();

  // Enable whitelist sale (if needed)
  if (!await contract.whitelistMintEnabled()) {
    console.log('Enabling whitelist sale...');

    await (await contract.setWhitelistMintEnabled(true)).wait();
  }

  console.log('Whitelist sale has been enabled!');

  if (!await contract.remiliaSaleEnabled()) {
    console.log('Enabling remilialist sale...');

    await (await contract.setRemiliaSaleEnabled(true)).wait();
  }

  console.log('RemiliaSale sale has been enabled!');
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
