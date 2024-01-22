import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { BalanceDisplayComponent } from './balance-display/balance-display.component';

declare global {
  interface Window {
    ethereum: any;
  }
}

@NgModule({
  declarations: [AppComponent, BalanceDisplayComponent],
  imports: [BrowserModule, FormsModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
