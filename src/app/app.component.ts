import { Component } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ProviderService } from './services/provider.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = '1inch crypto';

  private componentDestroyed$: Subject<void> = new Subject<void>();

  currentAccount$!: Observable<string>;
  currentBalance$!: Observable<string | undefined>;

  constructor(public providerService: ProviderService) {
    this.currentAccount$ = this.providerService.currentAccount$;
    this.currentBalance$ = this.providerService.currentBalance$;
  }

  async ngOnInit() {
    // await this.transferTokens();
  }

  connectToWallet() {
    this.providerService.connectWallet();
  }

  // Не получилось, не хватило времени разобраться
  // async transferTokens() {
  //   try {
  //     const senderAddress = this.providerService.currentAccount$.value;
  //     const recipientAddress = '0x0616E9455bD5d5D27C3DfF2713a9A2E045B68121';
  //     const tokenContractAddress = '0x7daf26D64a62e2e1dB838C84bCAc5bdDb3b5D926';
  //     const amountToSend = 0.2;

  //     const transactionHash = await this.providerService.transferTokens(
  //       amountToSend,
  //       recipientAddress,
  //       tokenContractAddress
  //     );

  //     if (transactionHash) {
  //       console.log('Transaction Hash:', transactionHash);
  //     } else {
  //       console.error('Transaction failed');
  //     }
  //   } catch (error) {
  //     console.error('Error during token transfer:', error);
  //   }
  // }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }
}
