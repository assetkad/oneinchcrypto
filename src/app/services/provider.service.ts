import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
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
import { abi } from '../core/contract-abi';
import { IBalance } from '../entities/IBalance';
import { MatSnackBar } from '@angular/material/snack-bar';
import Web3 from 'web3';
import { NetworkId } from '../core/network-ids';
import { ProviderId, ProviderUrl } from '../core/provider-url';
import { StorageService, Web3ModalConnections } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class ProviderService {
  ethersWeb3?: ethers.providers.Web3Provider;

  enabledChains: NetworkId[] = [
    NetworkId.eth,
    NetworkId.goerli,
    NetworkId.sepolia,
  ];
  providers = {
    [NetworkId.eth]: new ethers.providers.JsonRpcProvider(
      ProviderUrl.eth + ProviderId.infura1
    ),
    [NetworkId.goerli]: new ethers.providers.JsonRpcProvider(
      ProviderUrl.goerli + ProviderId.infura1
    ),
    [NetworkId.sepolia]: new ethers.providers.JsonRpcProvider(
      ProviderUrl.sepolia
    ),
  };

  signer?: ethers.providers.JsonRpcSigner;

  walletsIDs$ = new BehaviorSubject<string[]>([]);
  currentAccount$ = new BehaviorSubject(0);
  currentNetwork$ = new BehaviorSubject<number | undefined>(NetworkId.eth);
  currentBalance$ = new BehaviorSubject<IBalance | undefined>(undefined);

  notifyDisabledChain: ReplaySubject<true> = new ReplaySubject();

  constructor(public snackBar: MatSnackBar, public storage: StorageService) {
    if (!window.ethereum) {
      this.metaMaskNotFound();
    }
  }

  async detectConnectedProvider() {
    try {
      if (this.storage.getAccount()) {
        if (await this.isConnectedByMetaMask()) {
          await this.setEvmProvider(window.ethereum);
          return;
        }
      } else {
        this.metaMaskNotFound();
      }
    } catch (error) {
      console.error(error);
    }
  }

  private async setEvmProvider(connector: any): Promise<void> {
    this.setEthersWeb3(connector);
    this.listenEvents();
    await this.fetchAccountData();
  }

  private setEthersWeb3(proxy: any) {
    this.ethersWeb3 = new ethers.providers.Web3Provider(proxy);
  }

  private listenEvents() {
    (this.ethersWeb3?.provider as any).on('accountsChanged', () => {
      window.location.reload();
    });
    (this.ethersWeb3?.provider as any).on('chainChanged', (chain: any) => {
      if (
        this.storage.getAccount() &&
        this.currentNetwork$.getValue() !== chain
      ) {
        window.location.reload();
      }
    });
    (this.ethersWeb3?.provider as any).on('networkChanged', () => {
      if (this.storage.getAccount()) {
        window.location.reload();
      }
    });
    (this.ethersWeb3?.provider as any).on('disconnect', () => {
      this.disconnect();
      window.location.reload();
    });
  }

  async fetchAccountData() {
    await Promise.all([
      this.ethersWeb3?.listAccounts(),
      this.ethersWeb3?.getNetwork(),
      this.ethersWeb3?.getSigner(),
    ]).then((data: any) => {
      const account = data[0][0];
      this.currentAccount$.next(account);
      if (account) {
        this.storage.setWalletType(Web3ModalConnections.injected);
        this.storage.setAccount(account);
      } else {
        this.storage.unsetAccount();
      }
      this.currentNetwork$.next(data[1].chainId);
      this.notifyIfDisabledChain();
      this.signer = data[2];
      console.log(data);
    });
  }

  private async isConnectedByMetaMask(): Promise<boolean> {
    if (!this.hasMetaMaskExtension()) {
      return false;
    }
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return !!accounts.length;
  }

  hasMetaMaskExtension(): boolean {
    return window.hasOwnProperty('ethereum') && window.ethereum.isMetaMask;
  }

  // async getBalances(address: any): Promise<IBalance> {
  //   if (!this.provider) {
  //     throw new Error('Wallet not connected.');
  //   }

  //   const balance = await this.web3?.eth.getBalance(address);
  //   console.log(this.web3?.utils.fromWei(balance!, 'ether'), 'ETH');

  //   const ethBalance = utils.formatEther(
  //     await this.provider.getBalance(address)
  //   );

  //   this.web3?.eth.net.getId().then((networkID) => {
  //     if (networkID == 11155111n) {
  //     }
  //   });

  //   const contract = new ethers.Contract(
  //     '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  //     abi,
  //     this.provider
  //   );

  //   const wethBalance = await contract['balanceOf'](address);
  //   const res = {
  //     ethBalance,
  //     wethBalance: ethers.utils.formatUnits(wethBalance, 18),
  //   };
  //   this.currentBalance$.next(res);
  //   console.log(address, res);
  //   return res;
  // }

  // connectWallet(): Observable<string[]> {
  //   if (this.hasMetaMaskExtension()) {
  //     this.metaMaskNotFound();
  //     return of([]);
  //   }

  //   const requestAccounts$ = from(
  //     this.ethereum.request({ method: 'eth_requestAccounts' })
  //   );

  //   return requestAccounts$.pipe(
  //     switchMap((accounts: any) => {
  //       this.walletsIDs$.next(accounts);
  //       this.getBalances(accounts[this.currentAccount$.value]);
  //       return of(accounts);
  //     }),
  //     catchError((error: any) => this.handleError(error))
  //   );
  // }

  // private handleError(error: any): Observable<any> {
  //   console.error(error);
  //   this.snackBar.open(error.message, 'Close', {
  //     duration: 5000,
  //     panelClass: ['error-snackbar'],
  //   });

  //   if (
  //     error.message === 'Already processing eth_requestAccounts. Please wait.'
  //   ) {
  //     const requestPermissions$ = from(
  //       this.ethereum.request({
  //         method: 'wallet_requestPermissions',
  //         params: [{ eth_accounts: {} }],
  //       })
  //     );

  //     return requestPermissions$.pipe(
  //       switchMap(() => this.connectWallet()),
  //       catchError(() => of(undefined))
  //     );
  //   } else {
  //     return throwError(() => error);
  //   }
  // }

  // checkWalletConnected(): Observable<string[]> {
  //   return defer(() => this.getAccounts()).pipe(
  //     tap((accounts) => this.walletsIDs$.next(accounts)),
  //     catchError((error) => {
  //       console.error(error);
  //       return of([]);
  //     })
  //   );
  // }

  // private async getAccounts(): Promise<string[]> {
  //   if (!this.ethereum) {
  //     this.snackBar.open(
  //       'Metamask not found. Please install Metamask.',
  //       'Close',
  //       {
  //         duration: 5000,
  //         panelClass: ['error-snackbar'],
  //       }
  //     );
  //     console.error('Metamask not found. Please install Metamask.');
  //     return [];
  //   }

  //   const accounts = await this.ethereum.request({ method: 'eth_accounts' });
  //   return accounts;
  // }

  // getSelectedWalletAddress(index: number): string {
  //   const walletIDs = this.walletsIDs$.value;
  //   return walletIDs[index];
  // }

  // setCurrentWalletIndex(index: number): void {
  //   this.currentAccount$.next(index);
  //   localStorage.setItem('currentAccount', `${index}`);
  // }

  getAccount(): string | null {
    return this.storage.getAccount();
  }

  clearConnection() {
    this.storage.unsetAccount();
    localStorage.clear();
  }

  disconnect() {
    this.clearConnection();
    window.location.reload();
  }

  isOnEnabledChain() {
    return this.enabledChains.includes(this.getNetworkID());
  }

  notifyIfDisabledChain() {
    if (!this.isOnEnabledChain()) {
      this.notifyDisabledChain.next(true);
      this.notifyDisabledChain.complete();
    }
  }

  getEnabledNetIdOrDefault(): NetworkId {
    const chain = this.isOnEnabledChain() ? this.getNetworkID() : NetworkId.eth;
    return chain;
  }

  getProvider() {
    return this.getProviderByNetwork(this.getEnabledNetIdOrDefault());
  }

  getProviderByNetwork(networkID: NetworkId) {
    return this.providers[networkID];
  }

  getNetworkID(): NetworkId {
    const netId = this.currentNetwork$.getValue();
    return netId || NetworkId.eth;
  }

  metaMaskNotFound(): void {
    this.snackBar.open(
      'Metamask not found. Please install Metamask.',
      'Close',
      {
        duration: 5000,
        panelClass: ['error-snackbar'],
      }
    );
    console.error('Metamask not found. Please install Metamask.');
  }

  // private loadCurrentAccount(): void {
  //   const account = localStorage.getItem('currentAccount');
  //   account !== null && account !== undefined
  //     ? this.currentAccount$.next(+account)
  //     : this.currentAccount$.next(0);
  // }
}
