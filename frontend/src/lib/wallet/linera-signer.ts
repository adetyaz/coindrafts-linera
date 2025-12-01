/**
 * Custom Linera Wallet Signer for CoinDrafts
 * Based on: https://github.com/linera-io/linera-protocol/blob/testnet_conway/linera-web/signer/src/private-key.ts
 */

// Simplified Signer interface (until we install @linera/web)
interface Signer {
	sign(message: Uint8Array): Promise<Uint8Array>;
	getChainId(): string;
}

export class CoinDraftsWalletSigner implements Signer {
	private chainId: string;
	private privateKey: string;

	constructor(chainId: string, privateKey?: string) {
		this.chainId = chainId;
		// For demo: generate or use provided private key
		this.privateKey = privateKey || this.generatePrivateKey();
	}

	async sign(message: Uint8Array): Promise<Uint8Array> {
		// TODO: Implement signing logic
		// This would use the private key to sign the transaction bytes
		throw new Error('Signing not yet implemented');
	}

	getChainId(): string {
		return this.chainId;
	}

	private generatePrivateKey(): string {
		// Temporary: In production, this would be securely generated/stored
		return crypto.randomUUID();
	}
}

export class WalletManager {
	private static instance: WalletManager;
	private signer: CoinDraftsWalletSigner | null = null;

	static getInstance(): WalletManager {
		if (!WalletManager.instance) {
			WalletManager.instance = new WalletManager();
		}
		return WalletManager.instance;
	}

	connect(chainId: string): CoinDraftsWalletSigner {
		this.signer = new CoinDraftsWalletSigner(chainId);
		return this.signer;
	}

	disconnect() {
		this.signer = null;
	}

	getSigner(): CoinDraftsWalletSigner | null {
		return this.signer;
	}

	isConnected(): boolean {
		return this.signer !== null;
	}
}
