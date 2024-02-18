import { Component } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ProviderService } from './services/provider.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = '1inch Network';

  private componentDestroyed$: Subject<void> = new Subject<void>();

  currentAccount$!: Observable<string>;
  currentBalance$!: Observable<string | undefined>;

  sendTokensForm!: FormGroup;

  transactionHash = '';

  constructor(
    public providerService: ProviderService,
    private fb: FormBuilder
  ) {}

  async ngOnInit() {
    this.currentAccount$ = this.providerService.currentAccount$;
    this.currentBalance$ = this.providerService.currentBalance$;

    this.sendTokensForm = this.fb.group({
      recipientAddress: ['', Validators.required],
      amount: ['', Validators.required],
    });
  }

  connectToWallet() {
    this.providerService.connectWallet();
  }

  async sendTokens(): Promise<void> {
    const { recipientAddress, amount } = this.sendTokensForm.value;
    try {
      const transactionHash = await this.providerService.transferTokens(
        amount,
        recipientAddress
      );
      if (transactionHash) {
        console.log('Transaction Hash:', transactionHash);
        this.transactionHash = transactionHash;
      }
    } catch (error) {
      console.error('Error sending tokens:', error);
    }
  }

  ngOnDestroy() {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }
}
