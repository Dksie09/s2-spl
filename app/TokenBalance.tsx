import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

interface TokenBalanceProps {
  mintAddress: string;
}

function TokenBalance({ mintAddress }: TokenBalanceProps) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) return;

      try {
        const mintPublicKey = new PublicKey(mintAddress);
        const tokenAccount = await getAssociatedTokenAddress(
          mintPublicKey,
          publicKey
        );
        const account = await getAccount(connection, tokenAccount);
        setBalance(Number(account.amount));
      } catch (error: any) {
        console.error("Error fetching token balance:", error);
      }
    };

    fetchBalance();
    const intervalId = setInterval(fetchBalance, 10000); // Refresh every 10 seconds
    return () => clearInterval(intervalId);
  }, [connection, publicKey, mintAddress]);

  return (
    <Card className="w-full">
      <CardHeader>
        <h2 className="text-2xl font-bold">Token Balance</h2>
        <CardDescription>View your current token balance</CardDescription>
      </CardHeader>
      <CardContent>
        {balance !== null ? (
          <p className="text-lg font-semibold">Your token balance: {balance}</p>
        ) : (
          <p>Loading balance...</p>
        )}
      </CardContent>
    </Card>
  );
}

export default TokenBalance;
