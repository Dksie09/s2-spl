import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";

interface CreateTokenAccountProps {
  mintAddress: string;
}

function CreateTokenAccount({ mintAddress }: CreateTokenAccountProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [message, setMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCreateTokenAccount = async () => {
    if (!publicKey) {
      setMessage("Wallet not connected");
      return;
    }

    setIsProcessing(true);
    try {
      const mintPublicKey = new PublicKey(mintAddress);
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintPublicKey,
        publicKey
      );

      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          publicKey,
          associatedTokenAddress,
          publicKey,
          mintPublicKey
        )
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      setMessage(`Token account created: ${associatedTokenAddress.toBase58()}`);
    } catch (error: any) {
      setMessage(`Error creating token account: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <h2 className="text-2xl font-bold">Create Token Account</h2>
        <CardDescription>Create an account to hold your tokens</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleCreateTokenAccount}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? "Processing..." : "Create Token Account"}
        </Button>
        {message && <p className="mt-2 text-sm">{message}</p>}
      </CardContent>
    </Card>
  );
}

export default CreateTokenAccount;
