"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { BalanceDisplay } from "./BalanceDisplay";
import CreateMint from "./CreateMint";
import CreateTokenAccount from "./CreateTokenAccount";
import MintTokens from "./MintTokens";
import TransferTokens from "./TransferTokens";
import BurnTokens from "./BurnTokens";
import TokenBalance from "./TokenBalance";
import DelegateTokens from "./DelegateTokens";
import { useState } from "react";

export default function Home() {
  const { publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [mintAddress, setMintAddress] = useState<string | null>(null);

  const handleWalletAction = () => {
    if (publicKey) {
      disconnect();
    } else {
      setVisible(true);
    }
  };

  const handleMintCreated = (address: string) => {
    setMintAddress(address);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Duck Wallet</h1>
      <p className="mb-8 text-center">
        A simple web UI to create, mint, transfer, burn, and delegate Tokens.
      </p>
      <Button onClick={handleWalletAction} className="mb-8">
        {publicKey
          ? `${publicKey.toBase58().slice(0, 4)}...${publicKey
              .toBase58()
              .slice(-4)}`
          : "Connect Wallet"}
      </Button>

      {publicKey && (
        <div className="w-full max-w-4xl flex flex-col items-center">
          <BalanceDisplay />
          {!mintAddress ? (
            <div className="flex justify-center max-w-96 mt-8 items-center">
              <CreateMint onMintCreated={handleMintCreated} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              <CreateTokenAccount mintAddress={mintAddress} />
              <MintTokens mintAddress={mintAddress} />
              <TokenBalance mintAddress={mintAddress} />
              <DelegateTokens mintAddress={mintAddress} />
              <TransferTokens mintAddress={mintAddress} />
              <BurnTokens mintAddress={mintAddress} />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
