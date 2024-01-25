import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss',
})
export class WalletComponent {
  @Input() currentAccount!: string;
}
