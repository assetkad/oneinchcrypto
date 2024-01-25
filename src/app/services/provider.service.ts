import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Contract, ethers, utils } from 'ethers';
import { MatSnackBar } from '@angular/material/snack-bar';
import Web3 from 'web3';
import { NetworkId } from '../core/network-ids';
import { ProviderId, ProviderUrl } from '../core/provider-url';
import { StorageService, Web3ModalConnections } from './storage.service';
import { ABI } from '../core/config/abi/abi';

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
    amount: number,
    recipientAddress: string,
    tokenContractAddress: string
  ): Promise<string | undefined> {
    try {
      if (!this.ethersWeb3 || !this.signer) {
        console.error('Web3 or signer not available');
        return;
      }

      const abi = ABI;
      const tokenContract = new Contract(
        tokenContractAddress,
        abi,
        this.signer
      );

      const transaction = await tokenContract['transfer'](
        recipientAddress,
        utils.parseUnits(amount.toString(), 'wei')
      );

      console.log(transaction);

      const receipt = await transaction.wait();

      console.log(receipt);

      if (receipt.status === 1) {
        console.log('Transaction successful');
        return receipt.transactionHash;
      } else {
        console.error('Transaction failed');
        return;
      }
    } catch (error) {
      console.error('Error during token transfer:', error);
      return;
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
    console.error('Metamask not found. Please install Metamask.');
  }
}
