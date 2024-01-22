import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { WalletService } from './services/wallet.service';
import { BehaviorSubject, Observable, Subject, take } from 'rxjs';
import { IBalance } from './entities/IBalance';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title = '1inch crypto';

  walletIDs$ = new BehaviorSubject<string[]>([]);
  currentAccount: number;
  currentBalance$ = new BehaviorSubject<IBalance | undefined>(undefined);
  isConnecting = false;

  constructor(public walletService: WalletService) {
    this.currentAccount = localStorage.getItem('currentAccount')
      ? +localStorage.getItem('currentAccount')!
      : 0;
  }

  ngOnInit(): void {
    this.loadCurrentAccount();
    this.checkWalletConnected();
  }

  onAccountChange(): void {
    this.saveCurrentAccount();
    this.getBalances();
  }

  private saveCurrentAccount(): void {
    localStorage.setItem('currentAccount', `${this.currentAccount}`);
  }

  private loadCurrentAccount(): void {
    const account = localStorage.getItem('currentAccount');
    if (account !== null && account !== undefined) {
      this.currentAccount = +account;
    }
  }

  connectToWallet(): void {
    this.isConnecting = true;
    this.walletService.connectWallet().subscribe({
      next: (res) => {
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
  }

  getBalances() {
    const selectedAddress = this.getSelectedAddress();
    this.walletService
      .getBalances(selectedAddress)
      .then((balance) => this.currentBalance$.next(balance));
  }

  private getSelectedAddress(): string {
    const walletIDs = this.walletIDs$.value;
    return walletIDs[this.currentAccount];
  }

  checkWalletConnected(): void {
    this.walletService
      .checkWalletConnected()
      .then((accounts) => {
        if (accounts.length > 0) {
          this.walletIDs$.next(accounts);
          console.log(accounts);

          if (this.currentAccount < accounts.length) {
            this.getBalances();
          } else {
            console.error('Invalid currentAccount value');
          }
        }
      })
      .catch((e) => console.error(e));
  }
}
