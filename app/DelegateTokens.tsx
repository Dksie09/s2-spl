import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createApproveInstruction,
  createRevokeInstruction,
} from "@solana/spl-token";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface DelegateTokensProps {
  mintAddress: string;
}

function DelegateTokens({ mintAddress }: DelegateTokensProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [delegate, setDelegate] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDelegateTokens = async () => {
    if (!publicKey) {
      setMessage("Wallet not connected");
      return;
    }

    setIsProcessing(true);
    try {
      const mintPublicKey = new PublicKey(mintAddress);
      const delegatePublicKey = new PublicKey(delegate);
      const tokenAccount = await getAssociatedTokenAddress(
        mintPublicKey,
        publicKey
      );

      const transaction = new Transaction().add(
        createApproveInstruction(
          tokenAccount,
          delegatePublicKey,
          publicKey,
          BigInt(amount)
        )
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      setMessage(`Delegated ${amount} tokens to ${delegate}`);
    } catch (error: any) {
      setMessage(`Error delegating tokens: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevokeDelegate = async () => {
    if (!publicKey) {
      setMessage("Wallet not connected");
      return;
    }

    setIsProcessing(true);
    try {
      const mintPublicKey = new PublicKey(mintAddress);
      const tokenAccount = await getAssociatedTokenAddress(
        mintPublicKey,
        publicKey
      );

      const transaction = new Transaction().add(
        createRevokeInstruction(tokenAccount, publicKey)
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      setMessage("Delegation revoked successfully");
    } catch (error: any) {
      setMessage(`Error revoking delegation: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <h2 className="text-2xl font-bold">Delegate Tokens</h2>
        <CardDescription>
          Delegate spending authority of your tokens to another account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          value={delegate}
          onChange={(e) => setDelegate(e.target.value)}
          placeholder="Delegate address"
          className="mb-4"
        />
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount to delegate"
          className="mb-4"
        />
        <div className="flex space-x-4">
          <Button
            onClick={handleDelegateTokens}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? "Processing..." : "Delegate"}
          </Button>
          <Button
            onClick={handleRevokeDelegate}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? "Processing..." : "Revoke"}
          </Button>
        </div>
        {message && <p className="mt-2 text-sm">{message}</p>}
      </CardContent>
    </Card>
  );
}

export default DelegateTokens;
