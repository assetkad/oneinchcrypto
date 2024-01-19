import { Component } from '@angular/core';
import { WalletService } from './services/wallet.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'oneinchcrypto';

  public walletID: number | undefined;

  constructor(public walletService: WalletService) {
    this.checkWalletConnected();
  }

  connectToWallet = () => {
    this.walletService.connectWallet();
  };

  checkWalletConnected = async () => {
    const accounts = await this.walletService.checkWalletConnected();
    if (accounts.length > 0) {
      this.walletID = accounts[0];
    }
  };

  ngOnInit(): void {
    this.checkWalletConnected();
  }
}
