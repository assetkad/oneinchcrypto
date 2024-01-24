import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { IBalance } from './entities/IBalance';
import { ProviderService } from './services/provider.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  // title = '1inch crypto';
  // private componentDestroyed$: Subject<void> = new Subject<void>();
  // walletsIDs$!: Observable<string[]>;
  // currentAccount$!: Observable<number>;
  // currentBalance$!: Observable<IBalance | undefined>;
  // constructor(public providerService: ProviderService) {
  //   this.walletsIDs$ = this.providerService.walletsIDs$;
  //   this.currentAccount$ = this.providerService.currentAccount$;
  //   this.currentBalance$ = this.providerService.currentBalance$;
  // }
  // ngOnInit() {
  //   this.checkWalletConnected();
  // }
  // onAccountChange(selectedValue: number): void {
  //   this.providerService.setCurrentWalletIndex(selectedValue);
  //   this.getBalances();
  // }
  // connectToWallet(): void {
  //   this.providerService
  //     .connectWallet()
  //     .pipe(takeUntil(this.componentDestroyed$))
  //     .subscribe();
  // }
  // private getBalances() {
  //   const selectedWalletAddress = this.getSelectedWalletAddress();
  //   this.providerService.getBalances(selectedWalletAddress);
  // }
  // private getSelectedWalletAddress(): string {
  //   return this.providerService.getSelectedWalletAddress(
  //     this.providerService.currentAccount$.value
  //   );
  // }
  // checkWalletConnected(): void {
  //   this.providerService
  //     .checkWalletConnected()
  //     .pipe(takeUntil(this.componentDestroyed$))
  //     .subscribe({
  //       next: () => {
  //         this.getBalances();
  //       },
  //     });
  // }
  // ngOnDestroy() {
  //   this.componentDestroyed$.next();
  //   this.componentDestroyed$.complete();
  // }
}
