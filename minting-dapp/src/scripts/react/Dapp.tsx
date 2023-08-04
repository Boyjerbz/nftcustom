import React from 'react';
import { ethers, BigNumber } from 'ethers'
import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import detectEthereumProvider from '@metamask/detect-provider';
import NftContractType from '../lib/NftContractType';
import CollectionConfig from '../../../../smart-contract/config/CollectionConfig';
import NetworkConfigInterface from '../../../../smart-contract/lib/NetworkConfigInterface';
import CollectionStatus from './CollectionStatus';
import MintWidget from './MintWidget';
import whitelistAddresses from '../../../../smart-contract/config/whitelist.json';
import remilialistAddresses from '../../../../smart-contract/config/remilialist.json';




import { toast } from 'react-toastify';

const ContractAbi = require('../../../../smart-contract/artifacts/contracts/' + CollectionConfig.contractName + '.sol/' + CollectionConfig.contractName + '.json').abi;

interface Props {
}

interface State {
  userAddress: string|null;
  network: ethers.providers.Network|null;
  networkConfig: NetworkConfigInterface;
  totalSupply: number;
  maxSupply: number;
  selectedSale: string;
  maxMintAmountPerTx: number;
  maxMintAmountPerTxWhitelist: number;
  maxMintAmountPerTxRemilia: number;
  maxMintAmountPerTxPublic: number;
  tokenPrice: BigNumber;
  isPaused: boolean;
  loading: boolean;
  isWhitelistMintEnabled: boolean;
  isRemiliaSaleEnabled: boolean;
  isUserInWhitelist: boolean;
  isUserInRemiliaSale: boolean;
  whitelistAddresses: string[];
  remilialistAddresses: string[];
  errorMessage: string|JSX.Element|null;
}

const defaultState: State = {
  userAddress: null,
  network: null,
  networkConfig: CollectionConfig.mainnet,
  totalSupply: 0,
  maxSupply: 0,
  selectedSale: 'public',
  maxMintAmountPerTx: 0,
  maxMintAmountPerTxWhitelist: 3,
  maxMintAmountPerTxRemilia: 10,
  maxMintAmountPerTxPublic: 20,
  tokenPrice: BigNumber.from(0),
  isPaused: true,
  loading: false,
  isWhitelistMintEnabled: false,
  isRemiliaSaleEnabled: false,
  isUserInWhitelist: false,
  isUserInRemiliaSale: false,
  whitelistAddresses: [],
  remilialistAddresses: [],
  errorMessage: null,
};

const sales = {
  whitelist: { tokenPrice: ethers.utils.parseEther("0.025"), maxMintAmountPerTx: 3 },
  remilia: { tokenPrice: ethers.utils.parseEther("0.025"), maxMintAmountPerTx: 10 },
  public: { tokenPrice: ethers.utils.parseEther("0.045"), maxMintAmountPerTx: 20 }
};


export default class Dapp extends React.Component<Props, State> {
  provider!: Web3Provider;

  contract!: NftContractType;


  constructor(props: Props) {
    super(props);

    this.state = defaultState;
  }

  componentDidMount = async () => {
    const browserProvider = await detectEthereumProvider() as ExternalProvider;

    if (browserProvider?.isMetaMask !== true) {
      this.setError(
        <>
          We were not able to detect <strong>MetaMask</strong>. We value <strong>privacy and security</strong> a lot so we limit the wallet options on the DAPP.<br />
          <br />
          You can always interact with the smart-contract through <a href={this.generateContractUrl()} target="_blank">{this.state.networkConfig.blockExplorer.name}</a> 
          <br />
        
        </>,
      );
    }

    this.provider = new ethers.providers.Web3Provider(browserProvider);

    this.registerWalletEvents(browserProvider);

    await this.initWallet();
  }

  async mintTokens(amount: number): Promise<void>
  {
    try {
      this.setState({loading: true});
      const transaction = await this.contract.publicMint(amount, {value: this.state.tokenPrice.mul(amount)});

      toast.info(<>
        Transaction sent! Please wait...<br/>
        <a href={this.generateTransactionUrl(transaction.hash)} target="_blank" rel="noopener">View on {this.state.networkConfig.blockExplorer.name}</a>
      </>);

      const receipt = await transaction.wait();

      toast.success(<>
        Success!<br />
        <a href={this.generateTransactionUrl(receipt.transactionHash)} target="_blank" rel="noopener">View on {this.state.networkConfig.blockExplorer.name}</a>
      </>);

      this.refreshContractState();
      this.setState({loading: false});
    } catch (e) {
      this.setError(e);
      this.setState({loading: false});
    }
  }

  async whitelistMintTokens(amount: number): Promise<void>
{
  try {
    this.setState({loading: true});
    const transaction = await this.contract.whitelistMint(amount, {value: this.state.tokenPrice.mul(amount)}); // Removed Merkle proof

    toast.info(<>
      Transaction sent! Please wait...<br/>
      <a href={this.generateTransactionUrl(transaction.hash)} target="_blank" rel="noopener">View on {this.state.networkConfig.blockExplorer.name}</a>
    </>);

    const receipt = await transaction.wait();

    toast.success(<>
      Success!<br />
      <a href={this.generateTransactionUrl(receipt.transactionHash)} target="_blank" rel="noopener">View on {this.state.networkConfig.blockExplorer.name}</a>
    </>);

    this.refreshContractState();
    this.setState({loading: false});
  } catch (e) {
    this.setError(e);
    this.setState({loading: false});
  }
}


async remiliaMintTokens(amount: number): Promise<void>
{
  try {
    this.setState({loading: true});
    const transaction = await this.contract.remiliaMint(amount, {value: this.state.tokenPrice.mul(amount)}); // Removed Merkle proof

      toast.info(<>
        Transaction sent! Please wait...<br/>
        <a href={this.generateTransactionUrl(transaction.hash)} target="_blank" rel="noopener">View on {this.state.networkConfig.blockExplorer.name}</a>
      </>);

      const receipt = await transaction.wait();

      toast.success(<>
        Success!<br />
        <a href={this.generateTransactionUrl(receipt.transactionHash)} target="_blank" rel="noopener">View on {this.state.networkConfig.blockExplorer.name}</a>
      </>);

      this.refreshContractState();
      this.setState({loading: false});
    } catch (e) {
      this.setError(e);
      this.setState({loading: false});
    }
  }

  private isWalletConnected(): boolean
  {
    return this.state.userAddress !== null;
  }

  private isContractReady(): boolean
  {
    return this.contract !== undefined;
  }

  private isSoldOut(): boolean
  {
    return this.state.maxSupply !== 0 && this.state.totalSupply >= this.state.maxSupply;
  }

  private isNotMainnet(): boolean
  {
    return this.state.network !== null && this.state.network.chainId !== CollectionConfig.mainnet.chainId;
  }

  handleSaleChange = (selectedSale: string) => {
    let maxMintAmountPerTx, tokenPrice;
    // Logic to determine maxMintAmountPerTx and tokenPrice based on selectedSale
    if (selectedSale === 'public') {
      maxMintAmountPerTx = this.state.maxMintAmountPerTxPublic;
      tokenPrice = BigNumber.from(0.045);
    } else if (selectedSale === 'whitelist') {
      maxMintAmountPerTx = this.state.maxMintAmountPerTxWhitelist;
      tokenPrice = BigNumber.from(0);
    } else if (selectedSale === 'remilia') {
      maxMintAmountPerTx = this.state.maxMintAmountPerTxRemilia;
      tokenPrice = BigNumber.from(0.025);
    } else { // Default case
      maxMintAmountPerTx = 0; // Replace with appropriate default value
      tokenPrice = BigNumber.from(0); // Replace with appropriate default value
    }
    
    this.setState({ selectedSale, maxMintAmountPerTx, tokenPrice });
  }
  
  

  render() {
    return (
      <>
        {this.isNotMainnet() ?
          <div className="not-mainnet">
            You are not connected to the main network.
            <span className="small">Current network: <strong>{this.state.network?.name}</strong></span>
          </div>
          : null}

        {this.state.errorMessage ? <div className="error"><p>{this.state.errorMessage}</p><button onClick={() => this.setError()}>Close</button></div> : null}

        {this.isWalletConnected() ?
          <>
            {this.isContractReady() ?
              <>
                <CollectionStatus
                  userAddress={this.state.userAddress}
                  maxSupply={this.state.maxSupply}
                  totalSupply={this.state.totalSupply}
                  isPaused={this.state.isPaused}
                  selectedSale={this.state.selectedSale}
                  onSaleChange={this.handleSaleChange}
                  mintTokens={(mintAmount) => this.mintTokens(mintAmount)}
                  whitelistMintTokens={(mintAmount) => this.whitelistMintTokens(mintAmount)}
                  remiliaSaleMintTokens={(mintAmount) => this.remiliaMintTokens(mintAmount)}
                  maxMintAmountPerTx={this.state.maxMintAmountPerTx}
                  maxMintAmountPerTxWhitelist={this.state.maxMintAmountPerTxWhitelist}
                  maxMintAmountPerTxRemilia={this.state.maxMintAmountPerTxRemilia}
                  maxMintAmountPerTxPublic={this.state.maxMintAmountPerTxPublic}
                  isWhitelistMintEnabled={this.state.isWhitelistMintEnabled}
                  isRemiliaSaleEnabled={this.state.isRemiliaSaleEnabled}
                  isUserInWhitelist={this.state.isUserInWhitelist}
                  isUserInRemiliaSale={this.state.isUserInRemiliaSale}
                  isSoldOut={this.isSoldOut()}
                />
                {!this.isSoldOut() ?
                  <MintWidget
                    networkConfig={this.state.networkConfig}
                    maxSupply={this.state.maxSupply}
                    totalSupply={this.state.totalSupply}
                    tokenPrice={this.state.tokenPrice}
                    selectedSale={this.state.selectedSale}
                    maxMintAmountPerTx={this.state.maxMintAmountPerTx}
                    maxMintAmountPerTxWhitelist={this.state.maxMintAmountPerTxWhitelist}
                    maxMintAmountPerTxRemilia={this.state.maxMintAmountPerTxRemilia}
                    maxMintAmountPerTxPublic={this.state.maxMintAmountPerTxPublic}
                    isPaused={this.state.isPaused}
                    isWhitelistMintEnabled={this.state.isWhitelistMintEnabled}
                    isRemiliaSaleEnabled={this.state.isRemiliaSaleEnabled}
                    isUserInWhitelist={this.state.isUserInWhitelist}
                    isUserInRemiliaSale={this.state.isUserInRemiliaSale}
                    mintTokens={(mintAmount) => this.mintTokens(mintAmount)}
                    whitelistMintTokens={(mintAmount) => this.whitelistMintTokens(mintAmount)}
                    remiliaSaleMintTokens={(mintAmount) => this.remiliaMintTokens(mintAmount)}
                    loading={this.state.loading}
                  />
                  :
                  <div className="collection-sold-out">
                    <h2>核心 Maker are <strong>sold out</strong>!</h2>

                    You can buy Secondary on <a href={this.generateMarketplaceUrl()} target="_blank">{CollectionConfig.marketplaceConfig.name}</a>.
                  </div>
                }
              </>
              :
              <div className="collection-not-ready">
                <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>

                Loading collection data...
              </div>
            }
          </>
        :
          <div className="no-wallet">
            {!this.isWalletConnected() ? <button className="primary" disabled={this.provider === undefined} onClick={() => this.connectWallet()}>Connect Wallet</button> : null}

            <div className="use-block-explorer">
              <h2><strong>核心 Maker</strong><br/></h2></div>
              <p>Core Maker is the very essence of Foreign Fashion Lifestyles with deep roots
                <br/>within the Culture & People it is taken from.</p>
              <br />
              <p>5000 核心 Maker's</p>
              <br />
            <p>First 500 are Free for Milady Holders | 3 per Wallet<br/>
            Remilia Sale is half off for Milady, Remilio, & YAYO Holders<br/>0.025eth | 10 per Wallet</p>
              <br/>
              <p>Public Sale is 0.045eth | 10 per Wallet</p>
              
              
            

              {this.isWalletConnected() && (this.state.isWhitelistMintEnabled || this.state.isRemiliaSaleEnabled) ?
              <div className="sale-info">
                {/* You can add content here related to the whitelist or remilia sale if needed */}
              </div>
              : null}

          </div>
        }
      </>
    );
  }

  private setError(error: any = null): void
  {
    let errorMessage = 'Unknown error...';

    if (null === error || typeof error === 'string') {
      errorMessage = error;
    } else if (typeof error === 'object') {
      // Support any type of error from the Web3 Provider...
      if (error?.error?.message !== undefined) {
        errorMessage = error.error.message;
      } else if (error?.data?.message !== undefined) {
        errorMessage = error.data.message;
      } else if (error?.message !== undefined) {
        errorMessage = error.message;
      } else if (React.isValidElement(error)) {
        this.setState({errorMessage: error});

        return;
      }
    }

    this.setState({
      errorMessage: null === errorMessage ? null : errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1),
    });
  }

  private generateContractUrl(): string
  {
    return this.state.networkConfig.blockExplorer.generateContractUrl(CollectionConfig.contractAddress!);
  }

  private generateMarketplaceUrl(): string
  {
    return CollectionConfig.marketplaceConfig.generateCollectionUrl(CollectionConfig.marketplaceIdentifier, !this.isNotMainnet());
  }

  private generateTransactionUrl(transactionHash: string): string
  {
    return this.state.networkConfig.blockExplorer.generateTransactionUrl(transactionHash);
  }

  private async connectWallet(): Promise<void>
  {
    try {
      await this.provider.provider.request!({ method: 'eth_requestAccounts' });

      this.initWallet();
    } catch (e) {
      this.setError(e);
    }
  }

  private async refreshContractState(): Promise<void>
  {
    this.setState({
      maxSupply: (await this.contract.maxSupply()).toNumber(),
      totalSupply: (await this.contract.totalSupply()).toNumber(),
      maxMintAmountPerTxPublic: (await this.contract.maxMintAmountPerTxPublic()).toNumber(),
      tokenPrice: await this.contract.cost(),
      isPaused: await this.contract.paused(),
      isWhitelistMintEnabled: await this.contract.whitelistMintEnabled(),
      isRemiliaSaleEnabled: await this.contract.remiliaSaleEnabled(),
      isUserInWhitelist: whitelistAddresses.includes(this.state.userAddress ?? ''),
      isUserInRemiliaSale: remilialistAddresses.includes(this.state.userAddress ?? ''),
    });
  }

  private async initWallet(): Promise<void>
  {
    const walletAccounts = await this.provider.listAccounts();

    this.setState(defaultState);

    if (walletAccounts.length === 0) {
      return;
    }

    const network = await this.provider.getNetwork();
    let networkConfig: NetworkConfigInterface;

    if (network.chainId === CollectionConfig.mainnet.chainId) {
      networkConfig = CollectionConfig.mainnet;
    } else if (network.chainId === CollectionConfig.testnet.chainId) {
      networkConfig = CollectionConfig.testnet;
    } else {
      this.setError('Unsupported network!');

      return;
    }

    this.setState({
      userAddress: walletAccounts[0],
      network,
      networkConfig,
    });

    if (await this.provider.getCode(CollectionConfig.contractAddress!) === '0x') {
      this.setError('Could not find the contract, are you connected to the right chain?');

      return;
    }

    this.contract = new ethers.Contract(
      CollectionConfig.contractAddress!,
      ContractAbi,
      this.provider.getSigner(),
    ) as NftContractType;

    this.refreshContractState();
  }

  private registerWalletEvents(browserProvider: ExternalProvider): void
  {
    // @ts-ignore
    browserProvider.on('accountsChanged', () => {
      this.initWallet();
    });

    // @ts-ignore
    browserProvider.on('chainChanged', () => {
      window.location.reload();
    });
  }
}
