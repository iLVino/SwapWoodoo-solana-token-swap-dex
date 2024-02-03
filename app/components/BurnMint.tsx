import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Box, Button, FormControl, FormLabel, NumberInput, NumberInputField, Select } from "@chakra-ui/react";
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
    const tokenBPublicKey = new PublicKey("8YTgKfGt2MJ56HM8vAGkq5hQZ5e7y2jtbuK97Go4UPbK");
    const tokenBMintAddress = new PublicKey("4H7DTbBB61hPxQeLRkLvik4jZFT1Z45VzG1RNnxhhPck");

    const tokenAList = [
        { name: "Token PDM", publicKey: "DCcY1TJgUH6udTZu6chNyYDZ7foaMJikqsTTucZvRfks", mintAddress: "GgfRTAFWHgqx9cdyRsUseaqqFKEByZYRo4jCZDrEkhdw" },
        { name: "Token SWQ", publicKey: "5FTBqsxYPbhUuc3mPSBTiEKzLSqNgy8YxhFai5gpEcY8", mintAddress: "DWiD4EVUtnsgqoGbdSK5kBjHRJ7XoGx58WPHBu7t73Dh" },
        // Add more tokens as needed
    ];

    // State for selected Token A
    const [selectedTokenA, setSelectedTokenA] = useState(tokenAList[0]);

    // Update Token A selection
    const handleTokenAChange = (event) => {
        const selectedToken = tokenAList.find(token => token.name === event.target.value);
        setSelectedTokenA(selectedToken);
    };

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
                <FormLabel color="gray.200">Select Token A</FormLabel>
                <Select color="gray.200" onChange={handleTokenAChange}>
                    {tokenAList.map((token, index) => (
                        <option key={index} value={token.name}>{token.name}</option>
                    ))}
                </Select>

                <FormLabel color="gray.200" mt={4}>Amount to Burn</FormLabel>
                <NumberInput value={amount} onChange={value => setAmount(parseFloat(value))}>
                    <NumberInputField color="gray.200" />
                </NumberInput>
            </FormControl>
            <Button mt={4} onClick={handleTokenSwap}>Burn&Mint Swap</Button>
        </Box>
    );
};


export default TokenSwapComponent;