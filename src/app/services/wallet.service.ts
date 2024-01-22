import { Observable, catchError, from, of, switchMap, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { ethers, utils } from 'ethers';
import { abi } from '../core/contract/contract-abi';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  ethereum: any;
  provider: ethers.providers.Web3Provider;

  constructor() {
    this.ethereum = window.ethereum;
    if (!this.ethereum) {
      console.error('Metamask not found. Please install Metamask.');
    }
    this.provider = new ethers.providers.Web3Provider(this.ethereum);
  }

  async getBalances(address: any): Promise<any> {
    if (!this.provider) {
      throw new Error('Wallet not connected.');
    }

    const ethBalance = utils.formatEther(
      await this.provider.getBalance(address)
    );
    console.log(address, ethBalance);

    const contract = new ethers.Contract(
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      abi,
      this.provider
    );

    const wethBalance = await contract['balanceOf'](address);
    const res = {
      ethBalance,
      wethBalance: ethers.utils.formatUnits(wethBalance, 18),
    };
    console.log(address, res);
    return res;
  }

  connectWallet(): Observable<any> {
    const requestAccounts$ = from(
      this.ethereum.request({ method: 'eth_requestAccounts' })
    );

    return requestAccounts$.pipe(
      switchMap((accounts: any) => {
        return of(accounts);
      }),
      catchError((error: any) => this.handleError(error))
    );
  }

  private handleError(error: any): Observable<any> {
    console.error(error);

    if (
      error.message === 'Already processing eth_requestAccounts. Please wait.'
    ) {
      const requestPermissions$ = from(
        this.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        })
      );

      return requestPermissions$.pipe(
        switchMap(() => this.connectWallet()),
        catchError(() => of(undefined))
      );
    } else {
      return throwError(() => error);
    }
  }

  async checkWalletConnected(): Promise<any> {
    try {
      if (!this.ethereum) {
        console.error('Metamask not found. Please install Metamask.');
        return [];
      }

      const accounts = await this.ethereum.request({ method: 'eth_accounts' });
      return accounts;
    } catch (e) {
      throw new Error('Failed to check wallet connection.');
    }
  }
}
