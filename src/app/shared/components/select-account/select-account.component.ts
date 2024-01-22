import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-select-account',
  templateUrl: './select-account.component.html',
  styleUrl: './select-account.component.scss',
})
export class SelectAccountComponent {
  @Input() options!: string[];
  @Input() selectedValue!: number;
  @Output() onSelectionChange = new EventEmitter<number>();
}
