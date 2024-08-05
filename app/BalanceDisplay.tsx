import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { FC, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CardStackIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const BalanceDisplay: FC = () => {
  const [balance, setBalance] = useState(0);
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    if (!connection || !publicKey) {
      return;
    }

    connection.onAccountChange(
      publicKey,
      (updatedAccountInfo) => {
        setBalance(updatedAccountInfo.lamports / LAMPORTS_PER_SOL);
      },
      "confirmed"
    );

    connection.getAccountInfo(publicKey).then((info) => {
      setBalance(info!.lamports);
    });
  }, [connection, publicKey]);

  return (
    <div>
      <p className=" text-center">
        {publicKey ? (
          <CardContent className=" mt-5">
            <span className="text-sm">
              Your balance is <span> {balance / LAMPORTS_PER_SOL} SOL</span>
            </span>
            <br />

            <br />
          </CardContent>
        ) : (
          "Connect your wallet to view balance"
        )}
      </p>
    </div>
  );
};
