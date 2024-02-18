import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
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
  signer?: ethers.providers.JsonRpcSigner;

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

  currentAccount$ = new BehaviorSubject('');
  currentNetwork$ = new BehaviorSubject<number | undefined>(NetworkId.eth);
  currentBalance$ = new BehaviorSubject<string | undefined>(undefined);

  notifyDisabledChain: ReplaySubject<true> = new ReplaySubject();

  constructor(
    public snackBar: MatSnackBar,
    public storageService: StorageService
  ) {
    if (!window.ethereum) {
      this.metaMaskNotFound();
    }

    this.currentAccount$.subscribe((account) => {
      this.ethersWeb3?.getBalance(account).then((balance) => {
        this.currentBalance$.next(
          Web3.utils.fromWei(balance.toString(), 'ether')
        );
      });
    });
  }

  async detectConnectedProvider() {
    try {
      if (this.hasMetaMaskExtension()) {
        await this.setEvmProvider(window.ethereum);
        return;
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
        this.storageService.getAccount() &&
        this.currentNetwork$.getValue() !== chain
      ) {
        window.location.reload();
      }
    });
    (this.ethersWeb3?.provider as any).on('networkChanged', () => {
      if (this.storageService.getAccount()) {
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
        this.storageService.setWalletType(Web3ModalConnections.injected);
        this.storageService.setAccount(account);
      } else {
        this.storageService.unsetAccount();
      }
      this.currentNetwork$.next(data[1].chainId);
      this.notifyIfDisabledChain();
      this.signer = data[2];
      console.log(data);
    });
  }

  async connectWallet() {
    if (!this.ethersWeb3) {
      this.metaMaskNotFound();
      return;
    } else {
      await this.ethersWeb3.send('eth_requestAccounts', []).catch((err) => {
        this.processConnectingError(err);
      });

      await this.fetchAccountData();
    }
  }

  private processConnectingError(error: any): void {
    console.error(error);

    if (error.code === -32002) {
      this.ethersWeb3!.send('wallet_requestPermissions', [{ eth_accounts: {} }])
        .then(() => this.connectWallet())
        .catch((err) => console.log(err));
    }
  }

  hasMetaMaskExtension(): boolean {
    return window.hasOwnProperty('ethereum') && window.ethereum.isMetaMask;
  }

  async transferTokens(
    amount: string,
    recipientAddress: string
  ): Promise<string | void> {
    if (!this.signer) {
      console.error('No signer available');
      return;
    }
    try {
      const transactionResponse = await this.signer.sendTransaction({
        to: recipientAddress,
        value: ethers.utils.parseEther(`${amount}`),
        from: this.currentAccount$.value,
        gasLimit: 35000,
      });

      const transactionReceipt = await transactionResponse.wait();
      console.log(transactionReceipt.transactionHash);
      this.transactionSuccess();
      const balance = await this.signer.getBalance();
      this.currentBalance$.next(ethers.utils.formatEther(balance));
      return transactionReceipt.transactionHash;
    } catch (error: any) {
      if (error.code === 'INSUFFICIENT_FUNDS') {
        console.log('not enough funds to pay for gas fees');
      }

      if (error.code === 'NETWORK_ERROR') {
        console.log(
          "could not validate transaction, check that you're on the right network"
        );
      }

      if (error.code === 'TRANSACTION_REPLACED') {
        console.log(
          'the transaction was replaced by another transaction with the same nonce'
        );
      }
      throw error;
    }
  }

  getAccount(): string | null {
    return this.storageService.getAccount();
  }

  clearConnection() {
    this.storageService.unsetAccount();
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
  }

  transactionSuccess(): void {
    this.snackBar.open('The transaction was successful', 'Close', {
      duration: 5000,
      panelClass: ['notif-success'],
    });
  }
}
