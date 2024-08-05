import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createMintToInstruction,
} from "@solana/spl-token";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface MintTokensProps {
  mintAddress: string;
}

function MintTokens({ mintAddress }: MintTokensProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [amount, setAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMintTokens = async () => {
    if (!publicKey) {
      setMessage("Wallet not connected");
      setIsError(true);
      return;
    }

    setIsProcessing(true);
    setIsError(false);
    try {
      const mintPublicKey = new PublicKey(mintAddress);
      const tokenAccount = await getAssociatedTokenAddress(
        mintPublicKey,
        publicKey
      );

      const transaction = new Transaction().add(
        createMintToInstruction(
          mintPublicKey,
          tokenAccount,
          publicKey,
          BigInt(amount)
        )
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      setMessage(`Minted ${amount} tokens to ${tokenAccount.toBase58()}`);
    } catch (error: any) {
      setMessage(`Error minting tokens: ${error.message}`);
      setIsError(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <h2 className="text-2xl font-bold">Mint Tokens</h2>
        <CardDescription>
          Create new tokens and add them to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount to mint"
          className="mb-4"
        />
        <Button
          onClick={handleMintTokens}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? "Processing..." : "Mint Tokens"}
        </Button>
        {message && (
          <p className={`mt-2 text-xs ${isError ? "text-red-500" : ""}`}>
            {message}
          </p>
        )}
        {isError && (
          <p className="text-red-500 text-sm mt-2">
            Make sure you&apos;ve created a token account.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default MintTokens;
