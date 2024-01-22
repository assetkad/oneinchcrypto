import {
  BehaviorSubject,
  Observable,
  catchError,
  defer,
  from,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { Injectable } from '@angular/core';
import { ethers, utils } from 'ethers';
import { abi } from '../core/contract/contract-abi';
import { IBalance } from '../entities/IBalance';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  ethereum: any;
  provider: ethers.providers.Web3Provider | undefined;

  walletsIDs$ = new BehaviorSubject<string[]>([]);
  currentWalletIndex: number;
  currentBalance$ = new BehaviorSubject<IBalance | undefined>(undefined);

  constructor(public snackBar: MatSnackBar) {
    this.ethereum = window.ethereum;
    if (!this.ethereum) {
      this.snackBar.open(
        'Metamask not found. Please install Metamask.',
        'Close',
        {
          duration: 5000,
          panelClass: ['error-snackbar'],
        }
      );
      console.error('Metamask not found. Please install Metamask.');
    } else {
      this.provider = new ethers.providers.Web3Provider(this.ethereum);
    }
    this.currentWalletIndex = this.loadCurrentAccount();
  }

  async getBalances(address: any): Promise<IBalance> {
    if (!this.provider) {
      throw new Error('Wallet not connected.');
    }

    const ethBalance = utils.formatEther(
      await this.provider.getBalance(address)
    );

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
    this.currentBalance$.next(res);
    console.log(address, res);
    return res;
  }

  connectWallet(): Observable<string[]> {
    const requestAccounts$ = from(
      this.ethereum.request({ method: 'eth_requestAccounts' })
    );

    return requestAccounts$.pipe(
      switchMap((accounts: any) => {
        this.walletsIDs$.next(accounts);
        this.getBalances(accounts[this.currentWalletIndex]);
        return of(accounts);
      }),
      catchError((error: any) => this.handleError(error))
    );
  }

  private handleError(error: any): Observable<any> {
    console.error(error);
    this.snackBar.open(error.message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });

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

  checkWalletConnected(): Observable<string[]> {
    return defer(() => this.getAccounts()).pipe(
      tap((accounts) => this.walletsIDs$.next(accounts)),
      catchError((error) => {
        console.error(error);
        return of([]);
      })
    );
  }

  private async getAccounts(): Promise<string[]> {
    if (!this.ethereum) {
      this.snackBar.open(
        'Metamask not found. Please install Metamask.',
        'Close',
        {
          duration: 5000,
          panelClass: ['error-snackbar'],
        }
      );
      console.error('Metamask not found. Please install Metamask.');
      return [];
    }

    const accounts = await this.ethereum.request({ method: 'eth_accounts' });
    return accounts;
  }

  getSelectedWalletAddress(index: number): string {
    const walletIDs = this.walletsIDs$.value;
    return walletIDs[index];
  }

  setCurrentWalletIndex(index: number): void {
    this.currentWalletIndex = index;
    localStorage.setItem('currentAccount', `${index}`);
  }

  private loadCurrentAccount(): number {
    const account = localStorage.getItem('currentAccount');
    return account !== null && account !== undefined ? +account : 0;
  }
}
