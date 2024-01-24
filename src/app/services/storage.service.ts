import { Injectable } from '@angular/core';

export enum Web3ModalConnections {
  injected = 'injected',
  walletconnect = 'walletconnect',
  coinbase = 'custom-coinbase',
}

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  setAccount(address: string): void {
    localStorage.setItem('currentAccount', address);
  }

  unsetAccount(): void {
    localStorage.removeItem('currentAccount');
  }

  getAccount(): string | null {
    return localStorage.getItem('currentAccount');
  }

  setWalletType(type: Web3ModalConnections | string) {
    sessionStorage.setItem('connection', type);
  }

  getWalletType() {
    return sessionStorage.getItem('connection');
  }
}
