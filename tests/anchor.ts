import BN from "bn.js";
import assert from "assert";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import type { TokenSwapProgram } from "../target/types/token_swap_program";
describe("Token Swap Program", async () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.TokenSwapProgram as anchor.Program<TokenSwapProgram>;
  
  const program = anchor.workspace.TokenSwapProgram;
  const amount = new anchor.BN(1); // Example swap amount

  // Define the necessary accounts

  const tokenAPublicKey = "DCcY1TJgUH6udTZu6chNyYDZ7foaMJikqsTTucZvRfks";
  const tokenAMintAddress = "GgfRTAFWHgqx9cdyRsUseaqqFKEByZYRo4jCZDrEkhdw";

  const tokenBPublicKey = "C3fRT6FgfqCZwQ3Z7vc2ZH4tnqPWaJpWrDbV3onhU3po";
  const tokenBMintAddress = "33xYupwW3zdDFfUi4zE4LXvLp8caqjLeFDFsG8ZTowM4";
  const tokenOwnerPublicKey = program.provider.publicKey.toString();

  before(async () => {
    // Initialize the necessary accounts here
    // This includes creating mint accounts for Token A and Token B,
    // token accounts for holding these tokens, and setting up the owners.
    // You will need to use the Token Program from the SPL to set these up.
  });

  it("should swap tokens correctly", async () => {
    // Prepare the context for the swap_tokens call
    const context = {
      accounts: {
        tokenAAccount: new anchor.web3.PublicKey(tokenAPublicKey),
        tokenAMint: new anchor.web3.PublicKey(tokenAMintAddress),
        tokenAOwner: program.provider.publicKey,
        tokenBAccount: new anchor.web3.PublicKey(tokenBPublicKey), // Corrected to tokenBPublicKey
        tokenBMint: new anchor.web3.PublicKey(tokenBMintAddress),
        tokenBOwner: program.provider.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      },
    };

    // Call the swap_tokens function
    await program.rpc.swapTokens(amount, context);

    // Fetch updated balances for Token A and Token B accounts
    const tokenABalanceAfter = await program.provider.connection.getTokenAccountBalance(tokenAPublicKey);
    const tokenBBalanceAfter = await program.provider.connection.getTokenAccountBalance(tokenBPublicKey);

    // Assert the expected changes in balance
    assert.equal(tokenABalanceAfter, 1);
    assert.equal(tokenBBalanceAfter, 1 /* expected balance after mint */);
  });

  // Helper function to get token balance
  const tokenBBalance = await program.provider.connection.getTokenAccountBalance(
    new web3.PublicKey(tokenBPublicKey),
    "confirmed"
  );
  console.log(`TokenB balance: ${tokenBBalance.value.uiAmountString}`);
});
