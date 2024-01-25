import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BalanceDisplayComponent } from './components/balance-display/balance-display.component';
import { WalletComponent } from './components/wallet/wallet.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [BalanceDisplayComponent, WalletComponent],
  imports: [CommonModule, FormsModule],
  exports: [BalanceDisplayComponent, WalletComponent],
})
export class SharedModule {}
