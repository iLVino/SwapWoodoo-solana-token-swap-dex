use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, MintTo, Token, TokenAccount};

declare_id!("CkDEBSt52MZaHatWguaDb8qaSmcbv1H6cbAP8Jc1tRjK");

#[program]
pub mod token_swap_program {
    use super::*;

    pub fn swap_tokens(ctx: Context<SwapTokens>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        msg!("Swapping tokens");
        msg!("Amount: {}", amount);

        // Burn Token A
        msg!("Burning Token A");
        let burn_ctx = ctx.accounts.into_burn_context();
        token::burn(burn_ctx, amount)?;
        msg!("Token A burned");

        // Mint Token B
        msg!("Minting Token B");
        let mint_ctx = ctx.accounts.into_mint_to_context();
        token::mint_to(mint_ctx, amount)?;
        msg!("Token B minted");

        Ok(())
    }
}

#[derive(Accounts)]
pub struct SwapTokens<'info> {
    #[account(mut, associated_token::mint = token_a_mint, associated_token::authority = token_a_owner)]
    pub token_a_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_a_mint: Account<'info, Mint>,
    #[account(mut)]
    pub token_a_owner: Signer<'info>,

    #[account(mut, associated_token::mint = token_b_mint, associated_token::authority = token_b_owner)]
    pub token_b_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_b_mint: Account<'info, Mint>,
    #[account(mut)]
    pub token_b_owner: Signer<'info>,

    #[account(address = token::ID)]
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
        let cpi_accounts = MintTo {
            mint: self.token_b_mint.to_account_info(),
            to: self.token_b_account.to_account_info(),
            authority: self.token_b_owner.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("The provided amount must be greater than zero.")]
    InvalidAmount,
}
