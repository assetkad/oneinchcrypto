import {
  EMPTY,
  Observable,
  catchError,
  from,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { Injectable } from '@angular/core';
import { ethers, utils } from 'ethers';
import { abi } from '../core/contract/contract-abi';
import { Web3Provider } from '@ethersproject/providers';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  public ethereum;
  contractProps: any = {};
  public currentAccount = 0;
  provider!: Web3Provider;

  constructor() {
    const { ethereum } = window;
    this.ethereum = ethereum;
    if (!ethereum) {
      console.error('Metamask not found. Please install Metamask.');
    }
    this.provider = new ethers.providers.Web3Provider(ethereum);
  }

  async getEthBalance(address: any): Promise<any> {
    if (!this.provider) {
      throw new Error('Wallet not connected.');
    }
    const balance = await this.provider.getBalance(address);
    console.log({ ethBalance: utils.formatEther(balance) });
    return { ethBalance: utils.formatEther(balance) };
  }

  async getWethBalance(address: any): Promise<any> {
    if (!this.provider) {
      throw new Error('Wallet not connected.');
    }
    const contract = new ethers.Contract(
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      abi,
      this.provider
    );
    const balance = await contract['balanceOf'](address);
    const res = { wethBalance: ethers.utils.formatUnits(balance, 18) }; // убрать
    console.log(res);
    return res;
  }

  public connectWallet = (): Observable<any> => {
    const requestAccounts$ = from(
      this.ethereum?.request({ method: 'eth_requestAccounts' })
    );

    return requestAccounts$.pipe(
      switchMap((accounts: any) => {
        return of(accounts);
      }),
      catchError((error: any) => this.handleError(error))
    );
  };

  private handleError(error: any): Observable<any> {
    console.error(error);

    if (
      error.message === 'Already processing eth_requestAccounts. Please wait.'
    ) {
      const requestPermissions$ = from(
        window.ethereum.request({
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

  public checkWalletConnected = async () => {
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
  };
}
