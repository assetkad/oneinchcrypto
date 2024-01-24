import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { ProviderService } from './services/provider.service';
import { AbiProvider } from './core/config/abi/abiInjector';

declare global {
  interface Window {
    ethereum: any;
  }
}

export function initializeApp(provider: ProviderService) {
  return () => {
    return provider.detectConnectedProvider();
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    SharedModule,
    AppRoutingModule,
  ],
  providers: [
    ProviderService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ProviderService],
      multi: true,
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { horizontalPosition: 'right', verticalPosition: 'top' },
    },
    AbiProvider,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
