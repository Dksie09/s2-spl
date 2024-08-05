import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface CreateMintProps {
  onMintCreated: (mintAddress: string) => void;
}

function CreateMint({ onMintCreated }: CreateMintProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [decimals, setDecimals] = useState<string>("9");
  const [message, setMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCreateMint = async () => {
    if (!publicKey) {
      setMessage("Wallet not connected");
      return;
    }

    setIsProcessing(true);
    try {
      const mint = Keypair.generate();
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint.publicKey,
          space: 82,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mint.publicKey,
          Number(decimals),
          publicKey,
          publicKey
        )
      );

      const signature = await sendTransaction(transaction, connection, {
        signers: [mint],
      });
      await connection.confirmTransaction(signature, "confirmed");

      const mintAddress = mint.publicKey.toBase58();
      setMessage(`Mint created successfully: ${mintAddress}`);
      onMintCreated(mintAddress);
    } catch (error: any) {
      setMessage(`Error creating mint: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <h2 className="text-2xl font-bold">Create Token Mint</h2>
        <CardDescription>
          Create a new token mint to issue your own tokens
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          type="number"
          value={decimals}
          onChange={(e) => setDecimals(e.target.value)}
          placeholder="Decimals"
          className="mb-4"
        />
        <Button
          onClick={handleCreateMint}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? "Processing..." : "Create Mint"}
        </Button>
        {message && <p className="mt-2 text-sm">{message}</p>}
      </CardContent>
    </Card>
  );
}

export default CreateMint;
