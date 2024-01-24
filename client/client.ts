import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import type { TokenSwapProgram } from "../target/types/token_swap_program";
import provider from "@project-serum/anchor/dist/cjs/provider";

// Configure the client to use the local cluster
anchor.setProvider(anchor.AnchorProvider.env());
const program = anchor.workspace.TokenSwapProgram as anchor.Program<TokenSwapProgram>;



// Assuming 'pg' is already defined and initialized in your environment
console.log("My address:", program.provider.publicKey.toString());

// Define public keys for Token A and Token B
const tokenAPublicKey = new web3.PublicKey(
  "DCcY1TJgUH6udTZu6chNyYDZ7foaMJikqsTTucZvRfks"
);
const tokenAMintAddress = new web3.PublicKey(
  "GgfRTAFWHgqx9cdyRsUseaqqFKEByZYRo4jCZDrEkhdw"
);
const tokenBPublicKey = new web3.PublicKey(
  "7dekzLRXR2dzyUkQL4dpXdsdJwdfcxziRmVsd4v7Q4hb"
);
const tokenBMintAddress = new web3.PublicKey(
  "6Tj73eUiEhkF4PEDpS2urtpXLL9SuKVBVLzyrKqjgi4n"
);

const { publicKey, sendTransaction } = useWallet()

async function main() {
  const amount = new anchor.BN(1000000);
  console.log(`Amount to swap: ${amount}`);

  try {
    // Log Token A and Token B balances before swapping
    let tokenABalanceBefore = await program.provider.connection.getTokenAccountBalance(
      tokenAPublicKey,
      "confirmed"
    );
    let tokenBBalanceBefore = await program.provider.connection.getTokenAccountBalance(
      tokenBPublicKey,
      "confirmed"
    );
    console.log(
      `Token A balance before swap: ${tokenABalanceBefore.value.uiAmountString}`
    );
    console.log(
      `Token B balance before swap: ${tokenBBalanceBefore.value.uiAmountString}`
    );

    // Call the swap_tokens function
    await program.methods
      .swapTokens(amount)
      .accounts({
        tokenAAccount: tokenAPublicKey,
        tokenAMint: tokenAMintAddress,
        tokenAOwner: program.provider.publicKey,
        tokenBAccount: tokenBPublicKey,
        tokenBMint: tokenBMintAddress,
        tokenBOwner: program.provider.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      })
      .signers([anchor.Wallet.])
      .rpc();
    console.log("Token swap was successful");

    // Log Token A and Token B balances after swapping
    let tokenABalanceAfter = await program.provider.connection.getTokenAccountBalance(
      tokenAPublicKey,
      "confirmed"
    );
    let tokenBBalanceAfter = await program.provider.connection.getTokenAccountBalance(
      tokenBPublicKey,
      "confirmed"
    );
    console.log(
      `Token A balance after swap: ${tokenABalanceAfter.value.uiAmountString}`
    );
    console.log(
      `Token B balance after swap: ${tokenBBalanceAfter.value.uiAmountString}`
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

main()
  .then(() => console.log("Finished"))
  .catch((e) => console.error(e));

function getAccount() {
  throw new Error("Function not implemented.");
}
function useWallet(): { publicKey: any; sendTransaction: any; } {
  throw new Error("Function not implemented.");
}

