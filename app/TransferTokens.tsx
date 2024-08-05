import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface TransferTokensProps {
  mintAddress: string;
}

function TransferTokens({ mintAddress }: TransferTokensProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTransferTokens = async () => {
    if (!publicKey) {
      setMessage("Wallet not connected");
      return;
    }

    setIsProcessing(true);
    try {
      const mintPublicKey = new PublicKey(mintAddress);
      const recipientPublicKey = new PublicKey(recipient);

      const sourceAccount = await getAssociatedTokenAddress(
        mintPublicKey,
        publicKey
      );
      const destinationAccount = await getAssociatedTokenAddress(
        mintPublicKey,
        recipientPublicKey
      );

      const transaction = new Transaction();

      const recipientTokenAccountInfo = await connection.getAccountInfo(
        destinationAccount
      );

      if (!recipientTokenAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            destinationAccount,
            recipientPublicKey,
            mintPublicKey
          )
        );
      }

      transaction.add(
        createTransferInstruction(
          sourceAccount,
          destinationAccount,
          publicKey,
          BigInt(amount)
        )
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      setMessage(`Transferred ${amount} tokens to ${recipient}`);
    } catch (error: any) {
      setMessage(`Error transferring tokens: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <h2 className="text-2xl font-bold">Transfer Tokens</h2>
        <CardDescription>Send tokens to another account</CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Recipient address"
          className="mb-4"
        />
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount to transfer"
          className="mb-4"
        />
        <Button
          onClick={handleTransferTokens}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? "Processing..." : "Transfer Tokens"}
        </Button>
        {message && <p className="mt-2 text-sm">{message}</p>}
      </CardContent>
    </Card>
  );
}

export default TransferTokens;
