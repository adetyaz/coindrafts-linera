import { wallet, type WalletState } from './stores';
import { get } from 'svelte/store';

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (data: unknown) => void) => void;
  removeAllListeners: (event: string) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

class WalletService {
  private isConnecting = false;

  async connectWallet(): Promise<string | null> {
    if (this.isConnecting) return null;
    
    this.isConnecting = true;
    
    try {
      // Check if MetaMask or other wallet is available
      const ethereum = window.ethereum;
      
      if (ethereum) {
        // Request account access
        const accounts = await ethereum.request({
          method: 'eth_requestAccounts'
        }) as string[];
        
        if (accounts.length > 0) {
          const chainId = await ethereum.request({
            method: 'eth_chainId'
          }) as string;
          
          wallet.set({
            connected: true,
            address: accounts[0],
            chainId: chainId
          });
          
          // Listen for account changes
          ethereum.on('accountsChanged', (data: unknown) => {
            this.handleAccountsChanged(data as string[]);
          });
          ethereum.on('chainChanged', (data: unknown) => {
            this.handleChainChanged(data as string);
          });
          
          return accounts[0];
        }
      } else {
        throw new Error('No wallet found. Please install MetaMask or another Web3 wallet.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
    
    return null;
  }

  async disconnectWallet(): Promise<void> {
    wallet.set({
      connected: false,
      address: null,
      chainId: null
    });
    
    // Remove event listeners if they exist
    const ethereum = window.ethereum;
    if (ethereum) {
      ethereum.removeAllListeners('accountsChanged');
      ethereum.removeAllListeners('chainChanged');
    }
  }

  private handleAccountsChanged(accounts: string[]): void {
    if (accounts.length === 0) {
      this.disconnectWallet();
    } else {
      wallet.update((state: WalletState) => ({
        ...state,
        address: accounts[0]
      }));
    }
  }

  private handleChainChanged(chainId: string): void {
    wallet.update((state: WalletState) => ({
      ...state,
      chainId: chainId
    }));
  }

  async signTransaction(transaction: Record<string, unknown>): Promise<string> {
    // This would be used to sign Linera operations
    // For now, just a placeholder
    console.log('Signing transaction:', transaction);
    
    const ethereum = window.ethereum;
    const currentWallet = get(wallet);
    
    if (ethereum && currentWallet.address) {
      try {
        const signature = await ethereum.request({
          method: 'personal_sign',
          params: [JSON.stringify(transaction), currentWallet.address]
        }) as string;
        return signature;
      } catch (error) {
        console.error('Error signing transaction:', error);
        throw error;
      }
    }
    
    throw new Error('No wallet connected');
  }

  // Check if wallet is already connected on page load
  async checkConnection(): Promise<void> {
    const ethereum = window.ethereum;
    
    if (ethereum) {
      try {
        const accounts = await ethereum.request({
          method: 'eth_accounts'
        }) as string[];
        
        if (accounts.length > 0) {
          const chainId = await ethereum.request({
            method: 'eth_chainId'
          }) as string;
          
          wallet.set({
            connected: true,
            address: accounts[0],
            chainId: chainId
          });
          
          // Setup event listeners
          ethereum.on('accountsChanged', (data: unknown) => {
            this.handleAccountsChanged(data as string[]);
          });
          ethereum.on('chainChanged', (data: unknown) => {
            this.handleChainChanged(data as string);
          });
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  }
}

export const walletService = new WalletService();