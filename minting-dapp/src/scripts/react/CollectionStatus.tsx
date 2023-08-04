import React from 'react';

interface Props {
  userAddress: string | null;
  totalSupply: number;
  maxSupply: number;
  selectedSale: string;
  maxMintAmountPerTx: number;
  maxMintAmountPerTxWhitelist: number;
  maxMintAmountPerTxRemilia: number;
  maxMintAmountPerTxPublic: number;
  isPaused: boolean;
  isWhitelistMintEnabled: boolean;
  isRemiliaSaleEnabled: boolean;
  isUserInWhitelist: boolean;
  isUserInRemiliaSale: boolean;
  isSoldOut: boolean;
  onSaleChange: (selectedSale: string) => void;
  mintTokens(mintAmount: number): Promise<void>; // Add this if you want to pass down the mint functions
  whitelistMintTokens(mintAmount: number): Promise<void>;
  remiliaSaleMintTokens(mintAmount: number): Promise<void>;
}

interface State {
  selectedSale: string;
}

const defaultState: State = {
  selectedSale: 'public',
};

export default class CollectionStatus extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = defaultState;

    this.handleChange = this.handleChange.bind(this);
    this.mint = this.mint.bind(this);
  }

  private isSaleOpen(): boolean {
    return (this.props.isWhitelistMintEnabled || !this.props.isPaused) && !this.props.isSoldOut;
  }

  handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ selectedSale: event.target.value });
  }

  async mint() {
    const mintAmount = 1; // Set the mint amount as required
    switch (this.state.selectedSale) {
      case 'public':
        await this.props.mintTokens(mintAmount);
        break;
      case 'whitelist':
        await this.props.whitelistMintTokens(mintAmount);
        break;
      case 'remilia':
        await this.props.remiliaSaleMintTokens(mintAmount);
        break;
      default:
        // Handle error
    }
  }

  render() {
    const { isUserInWhitelist, isUserInRemiliaSale } = this.props;

    return (
      <>
        {/* Existing code for displaying the status */}
        
        <div>
          <select onChange={this.handleChange}>
            <option value="public">Public Sale</option>
            {isUserInWhitelist && <option value="whitelist">Whitelist Sale</option>}
            {isUserInRemiliaSale && <option value="remilia">Remilia Sale</option>}
          </select>
          
        </div>
      </>
    );
  }
}
