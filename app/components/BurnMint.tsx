import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Box, Button, FormControl, FormLabel, NumberInput, NumberInputField } from "@chakra-ui/react";
import * as anchor from "@coral-xyz/anchor";
import idl from '../idl/token_swap_program.json';
import { PublicKey } from '@solana/web3.js';


export const TokenSwapComponent = () => {
    const programId = new PublicKey(idl.metadata.address);
    const [amount, setAmount] = useState(0);
    const { connection } = useConnection();
    const wallet = useWallet();

    // Define public keys for Token A and Token B
    const tokenAPublicKey = new PublicKey("DCcY1TJgUH6udTZu6chNyYDZ7foaMJikqsTTucZvRfks");
    const tokenAMintAddress = new PublicKey("GgfRTAFWHgqx9cdyRsUseaqqFKEByZYRo4jCZDrEkhdw");
    const tokenBPublicKey = new PublicKey("7dekzLRXR2dzyUkQL4dpXdsdJwdfcxziRmVsd4v7Q4hb");
    const tokenBMintAddress = new PublicKey("6Tj73eUiEhkF4PEDpS2urtpXLL9SuKVBVLzyrKqjgi4n");

    const handleTokenSwap = async () => {
        if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
            console.error("Wallet is not connected or wallet functions are undefined");
            return;
        }

        const anchorWallet = {
            publicKey: wallet.publicKey,
            signTransaction: wallet.signTransaction,
            signAllTransactions: wallet.signAllTransactions
        };

        const provider = new anchor.AnchorProvider(
            connection,
            anchorWallet,
            anchor.AnchorProvider.defaultOptions()
        );

        const program = new anchor.Program(idl, programId, provider);

        try {
            // Swap tokens logic
            let txid = await program.methods.swapTokens(new anchor.BN(amount))
                .accounts({
                    tokenAAccount: tokenAPublicKey,
                    tokenAMint: tokenAMintAddress,
                    tokenAOwner: wallet.publicKey,
                    tokenBAccount: tokenBPublicKey,
                    tokenBMint: tokenBMintAddress,
                    tokenBOwner: wallet.publicKey,
                    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                })
                .rpc();
            alert(`Token Burn&Mint was successful! Transaction ID: https://explorer.solana.com/tx/${txid}?cluster=devnet`)
            console.log(`Token Burn&Mint was successful! Transaction ID: https://explorer.solana.com/tx/${txid}?cluster=devnet`);
        } catch (error) {
            console.error("Error in token swap:", error);
        }
    };

    return (
        <Box>
            <FormControl>
                <FormLabel color="gray.200">Amount to Swap</FormLabel>
                <NumberInput value={amount} onChange={value => setAmount(parseFloat(value))}>
                    <NumberInputField color="gray.200" />
                </NumberInput>
            </FormControl>
            <Button mt={4} onClick={handleTokenSwap}>Burn&Mint Swap</Button>
        </Box>
    );
};

export default TokenSwapComponent;
