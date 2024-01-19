import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  public ethereum;

  constructor() {
    const { ethereum } = <any>window;
    this.ethereum = ethereum;
  }

  public connectWallet = async () => {
    try {
      if (!this.ethereum) return alert('Please install metamask');
      const res = await this.ethereum.request({
        method: 'eth_requestAccounts',
      });
      console.log(res);
    } catch (e) {
      throw new Error('Not found ethereum');
    }
  };

  public checkWalletConnected = async () => {
    try {
      if (!this.ethereum) return alert('Please install meta mask ');
      const accounts = await this.ethereum.request({ method: 'eth_accounts' });
      console.log(accounts);
      return accounts;
    } catch (e) {
      throw new Error('No ethereum object found');
    }
  };
}
