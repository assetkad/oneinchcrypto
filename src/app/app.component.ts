import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { WalletService } from './services/wallet.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { IBalance } from './entities/IBalance';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = '1inch crypto';

  walletsIDs$!: Observable<string[]>;
  currentWalletIndex!: number;
  currentBalance$!: Observable<IBalance | undefined>;

  constructor(public walletService: WalletService) {
    this.walletsIDs$ = this.walletService.walletsIDs$;
    this.currentWalletIndex = this.walletService.currentWalletIndex;
    this.currentBalance$ = this.walletService.currentBalance$;
  }

  ngOnInit() {
    this.checkWalletConnected();
  }

  onAccountChange(selectedValue: number): void {
    this.walletService.setCurrentWalletIndex(selectedValue);
    this.getBalances();
  }

  connectToWallet(): void {
    this.walletService.connectWallet().subscribe();
  }

  private getBalances() {
    const selectedWalletAddress = this.getSelectedWalletAddress();
    this.walletService.getBalances(selectedWalletAddress);
  }

  private getSelectedWalletAddress(): string {
    return this.walletService.getSelectedWalletAddress(
      this.walletService.currentWalletIndex
    );
  }

  checkWalletConnected(): void {
    this.walletService.checkWalletConnected().subscribe({
      next: () => {
        this.getBalances();
      },
    });
  }
}
