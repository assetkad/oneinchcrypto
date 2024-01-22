import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WalletService } from './services/wallet.service';
import { Observable, Subject, take } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = '1inch crypto';

  public walletIDs$ = new Subject<String[]>();

  public currentAccount = 0;

  public isConnecting = false;

  constructor(public walletService: WalletService) {}

  ngOnInit(): void {
    this.checkWalletConnected();
    this.loadCurrentAccount();
  }

  private saveCurrentAccount() {
    localStorage.setItem('currentAccount', `${this.currentAccount}`);
  }

  private loadCurrentAccount() {
    const account = localStorage.getItem('currentAccount');
    if (account !== null && account !== undefined) {
      this.currentAccount = +account;
    }
  }

  onAccountChange() {
    this.saveCurrentAccount();
    this.walletIDs$.pipe(take(1)).subscribe((walletIDs) => {
      console.log(walletIDs);
      this.walletService.getEthBalance(walletIDs[this.currentAccount]);
      this.walletService.getWethBalance(walletIDs[this.currentAccount]);
    });
  }

  connectToWallet = () => {
    this.isConnecting = true;
    this.walletService.connectWallet().subscribe({
      next: (res) => {
        console.log(res);
        this.walletIDs$.next(res);
        this.isConnecting = false;
      },
      error: (error) => {
        console.error(error);
        this.isConnecting = false;
      },
      complete: () => {
        this.isConnecting = false;
        this.checkWalletConnected();
      },
    });
  };

  checkWalletConnected = async () => {
    try {
      const accounts = await this.walletService.checkWalletConnected();
      if (accounts.length > 0) {
        console.log(accounts);
        this.walletIDs$.next(accounts);
        this.walletService.getEthBalance(accounts[this.currentAccount]);
        this.walletService.getWethBalance(accounts[this.currentAccount]);
      }
    } catch (e) {
      console.error(e);
    }
  };
}
