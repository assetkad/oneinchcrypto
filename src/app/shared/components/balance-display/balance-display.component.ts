import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-balance-display',
  templateUrl: './balance-display.component.html',
  styleUrl: './balance-display.component.scss',
})
export class BalanceDisplayComponent {
  @Input() balance!: string;
}
