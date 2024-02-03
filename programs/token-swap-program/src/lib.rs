// token_swap_program.rs
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, MintTo, Token, TokenAccount};

declare_id!("CkDEBSt52MZaHatWguaDb8qaSmcbv1H6cbAP8Jc1tRjK");

#[program]
pub mod token_swap_program {
    use super::*;

    pub fn swap_tokens(ctx: Context<SwapTokens>, amount: u64) -> Result<()> {
        msg!("Swapping tokens");
        msg!("Amount: {}", amount);

        // Burn Token A
        msg!("Burning Token A");
        let burn_ctx: CpiContext<'_, '_, '_, '_, Burn<'_>> = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.token_a_mint.to_account_info(),
                from: ctx.accounts.token_a_account.to_account_info(),
                authority: ctx.accounts.token_a_owner.to_account_info(),
            },
        );
        token::burn(burn_ctx, amount)?;
        msg!("Token A burned");

        // Mint Token B
        msg!("Minting Token B");
        token::mint_to(ctx.accounts.into_mint_to_context(), amount)?;
        msg!("Token B minted");

        Ok(())
    }

    #[derive(Accounts)]
    pub struct SwapTokens<'info> {
        // Token A
        #[account(mut)]
        pub token_a_account: Account<'info, TokenAccount>,
        #[account(mut)]
        pub token_a_mint: Account<'info, Mint>,
        #[account(mut)]
        pub token_a_owner: AccountInfo<'info>,

        // Token B
        #[account(mut)]
        pub token_b_account: Account<'info, TokenAccount>,
        #[account(mut)]
        pub token_b_mint: Account<'info, Mint>,
        #[account(mut)]
        pub token_b_owner: AccountInfo<'info>,

        // SPL Token Program
        pub token_program: Program<'info, Token>,
    }

    impl<'info> SwapTokens<'info> {
        fn into_burn_context(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
            let cpi_accounts = Burn {
                mint: self.token_a_mint.to_account_info(),
                from: self.token_a_account.to_account_info(),
                authority: self.token_a_owner.to_account_info(),
            };
            CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
        }

        fn into_mint_to_context(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
            let cpi_accounts: MintTo<'_> = MintTo {
                mint: self.token_b_mint.to_account_info(),
                to: self.token_b_account.to_account_info(),
                authority: self.token_b_owner.to_account_info(),
            };
            CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
        }
    }
}
