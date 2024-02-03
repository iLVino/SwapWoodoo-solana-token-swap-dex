import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Box, Button, FormControl, FormLabel, NumberInput, NumberInputField, Select } from "@chakra-ui/react";
import * as anchor from '@coral-xyz/anchor';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import idl from '../idl/token_swap_program.json';
import { PublicKey } from '@solana/web3.js';

type TokenInfo = {
    mintAddress: string;
};

export const TokenSwapComponent = () => {
    const programId = new PublicKey(idl.metadata.address);
    const [amount, setAmount] = useState(0);
    const [selectedTokenA, setSelectedTokenA] = useState<string>('');
    const { connection } = useConnection();
    const wallet = useWallet();
    const [bumpSeed, setBumpSeed] = useState<number | null>(null);
    const [pda, setPda] = useState<PublicKey | null>(null);

    // Simplified token details
    const tokens: Record<string, TokenInfo> = {
        "DCcY1TJgUH6udTZu6chNyYDZ7foaMJikqsTTucZvRfks": { mintAddress: "GgfRTAFWHgqx9cdyRsUseaqqFKEByZYRo4jCZDrEkhdw" },
        "5FTBqsxYPbhUuc3mPSBTiEKzLSqNgy8YxhFai5gpEcY8": { mintAddress: "DWiD4EVUtnsgqoGbdSK5kBjHRJ7XoGx58WPHBu7t73Dh" },
        // Add more tokens here if needed
    };

    // Token B's details
    const tokenBPublicKey = new PublicKey("GFD6ANu1XQArAyhK6EKePjJAxR99Gc58RDksxaZ2ttqP");
    const tokenBMintAddress = new PublicKey("9vYN5mTnf3wCkG4VwVScJaWczZSRQUJpka7nMvJEcPX6");

    useEffect(() => {
        const findBumpSeed = async () => {
            try {
                if (pda === null || bumpSeed === null) {
                    console.log("Finding PDA and bump seed...");
                    const [pdaAddress, bump] = await PublicKey.findProgramAddress(
                        [Buffer.from("poll_123")], // Ensure the seed is correct
                        programId
                    );
                    console.log("PDA Address:", pdaAddress.toString(), "Bump Seed:", bump);
                    setPda(pdaAddress);
                    setBumpSeed(bump);
                }
            } catch (error) {
                console.error("Error calculating PDA and bump seed:", error);
            }
        };

        if (programId) {
            findBumpSeed();
        } else {
            console.log("Program ID not set");
        }
    }, [programId, pda, bumpSeed]); // Add pda and bumpSeed as dependencies



    const handleTokenSwap = async () => {
        if (!wallet.connected || !wallet.publicKey || !selectedTokenA || bumpSeed === null || pda === null) {
            console.error("Wallet is not connected, no token selected, or bump seed not set");
            return;
        }

        const tokenAPublicKey = new PublicKey(selectedTokenA);
        const tokenAMintAddress = new PublicKey(tokens[selectedTokenA].mintAddress);

        const provider = new AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
        const program = new Program(idl, programId, provider);

        try {
            let txid = await program.methods.swapTokens(new anchor.BN(amount))
                .accounts({
                    tokenAAccount: tokenAPublicKey,
                    tokenAMint: tokenAMintAddress,
                    tokenAOwner: wallet.publicKey,
                    tokenBAccount: tokenBPublicKey,
                    tokenBMint: tokenBMintAddress,
                    tokenMintAuthority: pda,
                    tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                })
                .rpc();
            console.log(`Token swap was successful! Transaction ID: https://explorer.solana.com/tx/${txid}?cluster=devnet`);
        } catch (error) {
            console.error("Error in token swap:", error);
        }
    };

    return (
        <Box>
            <FormControl>
                <FormLabel color="gray.200">Select Token A</FormLabel>
                <Select color="gray.200" placeholder="Select token" onChange={(e) => setSelectedTokenA(e.target.value)}>
                    {Object.keys(tokens).map((token, index) => (
                        <option key={index} value={token}>{token}</option>
                    ))}
                </Select>
            </FormControl>
            <FormControl mt={4}>
                <FormLabel color="gray.200">Amount to Burn&Swap</FormLabel>
                <NumberInput value={amount} onChange={(_, valueAsString) => setAmount(parseFloat(valueAsString))}>
                    <NumberInputField color="gray.200" />
                </NumberInput>
            </FormControl>
            <Button mt={4} onClick={handleTokenSwap}>Burn&Mint Swap</Button>
        </Box>
    );
};

export default TokenSwapComponent;
