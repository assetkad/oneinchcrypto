import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BalanceDisplayComponent } from './components/balance-display/balance-display.component';
import { SelectAccountComponent } from './components/select-account/select-account.component';
import { WalletComponent } from './components/wallet/wallet.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    BalanceDisplayComponent,
    SelectAccountComponent,
    WalletComponent,
  ],
  imports: [CommonModule, FormsModule],
  exports: [BalanceDisplayComponent, SelectAccountComponent, WalletComponent],
})
export class SharedModule {}
