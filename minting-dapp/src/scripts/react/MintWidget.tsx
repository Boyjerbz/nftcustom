import { utils, BigNumber } from 'ethers';
import React from 'react';
import NetworkConfigInterface from '../../../../smart-contract/lib/NetworkConfigInterface';

interface Props {
  networkConfig: NetworkConfigInterface;
  maxSupply: number;
  totalSupply: number;
  tokenPrice: BigNumber;
  selectedSale: string;
  maxMintAmountPerTx: number;
  maxMintAmountPerTxWhitelist: number;
  maxMintAmountPerTxRemilia: number;
  maxMintAmountPerTxPublic: number;
  isPaused: boolean;
  loading: boolean;
  isWhitelistMintEnabled: boolean;
  isRemiliaSaleEnabled: boolean;
  isUserInWhitelist: boolean;
  isUserInRemiliaSale: boolean;
  mintTokens(mintAmount: number): Promise<void>;
  whitelistMintTokens(mintAmount: number): Promise<void>;
  remiliaSaleMintTokens(mintAmount: number): Promise<void>; // Add this for Remilia sale
}

interface State {
  mintAmount: number;
}

const defaultState: State = {
  mintAmount: 1,
};

export default class MintWidget extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = defaultState;
  }

  private canMint(): boolean {
    return !this.props.isPaused && (this.props.isWhitelistMintEnabled || this.props.isRemiliaSaleEnabled);
  }

  private getMaxMintAmount(): number {
    if (this.props.isWhitelistMintEnabled && this.props.isUserInWhitelist) {
      return this.props.maxMintAmountPerTxWhitelist;
    }

    if (this.props.isRemiliaSaleEnabled && this.props.isUserInRemiliaSale) {
      return this.props.maxMintAmountPerTxRemilia;
    }

    return this.props.maxMintAmountPerTxPublic;
  }

  private incrementMintAmount(): void {
    this.setState({
      mintAmount: Math.min(this.getMaxMintAmount(), this.state.mintAmount + 1),
    });
  }

  private decrementMintAmount(): void {
    this.setState({
      mintAmount: Math.max(1, this.state.mintAmount - 1),
    });
  }

  private async mint(): Promise<void> {
    if (this.props.isWhitelistMintEnabled && this.props.isUserInWhitelist) {
      await this.props.whitelistMintTokens(this.state.mintAmount);
      return;
    }

    if (this.props.isRemiliaSaleEnabled && this.props.isUserInRemiliaSale) {
      await this.props.remiliaSaleMintTokens(this.state.mintAmount); // Call Remilia sale mint function
      return;
    }

    await this.props.mintTokens(this.state.mintAmount);
  }

  render() {
    return (
      <>
        {this.canMint() ?
          <div className={`mint-widget ${this.props.loading ? 'animate-pulse saturate-0 pointer-events-none' : ''}`}>
            <div className="preview">
              <img src="/build/images/preview.png" alt="Collection preview" />
            </div> 
            <div className="price">
              <strong>Total Price:</strong> {utils.formatEther(this.props.tokenPrice.mul(this.state.mintAmount))} {this.props.networkConfig.symbol}
            </div>
            <div className="controls">
              <button className="decrease" disabled={this.props.loading} onClick={() => this.decrementMintAmount()}>-</button>
              <span className="mint-amount">{this.state.mintAmount}</span>
              <button className="increase" disabled={this.props.loading} onClick={() => this.incrementMintAmount()}>+</button>
              <button className="primary" disabled={this.props.loading} onClick={() => this.mint()}>Mint</button>
            </div>
          </div>
          :
          <div className="cannot-mint">
            {this.props.isPaused ? <>The contract is <strong>paused</strong>.</> : <>You Are <strong>NOT</strong> on the WhiteList or Remilia Sale.</>}<br />
            Please always double-check everything.
          </div>
        }
      </>
    );
  }
}
