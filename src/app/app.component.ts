import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { WalletService } from './services/wallet.service';
import { BehaviorSubject } from 'rxjs';
import { IBalance } from './entities/IBalance';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title = '1inch crypto';

  walletsIDs$ = new BehaviorSubject<string[]>([]);
  currentWalletIndex: number;
  currentBalance$ = new BehaviorSubject<IBalance | undefined>(undefined);

  constructor(public walletService: WalletService) {
    this.currentWalletIndex = this.loadCurrentAccount();
  }

  ngOnInit(): void {
    this.checkWalletConnected();
  }

  onAccountChange(selectedValue: number): void {
    console.log(selectedValue);
    this.currentWalletIndex = selectedValue;
    this.saveCurrentAccount();
    this.getBalances();
  }

  private saveCurrentAccount(): void {
    localStorage.setItem('currentAccount', `${this.currentWalletIndex}`);
  }

  private loadCurrentAccount(): number {
    const account = localStorage.getItem('currentAccount');
    return account !== null && account !== undefined ? +account : 0;
  }

  connectToWallet(): void {
    this.walletService.connectWallet().subscribe({
      next: (res) => {
        this.walletsIDs$.next(res);
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        this.checkWalletConnected();
      },
    });
  }

  private getBalances() {
    const selectedWalletAddress = this.getSelectedWalletAddress();
    this.walletService
      .getBalances(selectedWalletAddress)
      .then((balance) => this.currentBalance$.next(balance));
  }

  private getSelectedWalletAddress(): string {
    const walletIDs = this.walletsIDs$.value;
    return walletIDs[this.currentWalletIndex];
  }

  checkWalletConnected(): void {
    this.walletService
      .checkWalletConnected()
      .then((accounts) => {
        if (accounts.length > 0) {
          this.walletsIDs$.next(accounts);
          console.log(accounts);

          if (this.currentWalletIndex < accounts.length) {
            this.getBalances();
          } else {
            console.error('Invalid currentAccount value');
          }
        }
      })
      .catch((e) => console.error(e));
  }
}
