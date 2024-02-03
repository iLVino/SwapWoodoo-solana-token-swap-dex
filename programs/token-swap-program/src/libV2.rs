use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, MintTo, Token, TokenAccount, Mint};

declare_id!("CkDEBSt52MZaHatWguaDb8qaSmcbv1H6cbAP8Jc1tRjK");
#[program]
pub mod token_swap_program {
    use super::*;

    pub fn swap_tokens(ctx: Context<SwapTokens>, bump: u8, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
    
        // Burn Token A
        let burn_ctx = ctx.accounts.into_burn_context();
        token::burn(burn_ctx, amount)?;
    
        // Mint Token B
        let seeds = &[b"token_mint_authority", &[bump][..]];
        let signer_seeds: &[&[u8]] = seeds;
        let binding = &[signer_seeds]; // Bind the temporary array to a variable
        let cpi_accounts = MintTo {
            mint: ctx.accounts.token_b_mint.to_account_info(),
            to: ctx.accounts.token_b_account.to_account_info(),
            authority: ctx.accounts.token_mint_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let mint_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, binding);
        token::mint_to(mint_ctx, amount)?;
    
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(bump: u8)] // Instruction parameter to pass the bump seed
pub struct SwapTokens<'info> {
    #[account(mut, associated_token::mint = token_a_mint, associated_token::authority = token_a_owner)]
    pub token_a_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_a_mint: Account<'info, Mint>,
    #[account(mut)]
    pub token_a_owner: Signer<'info>,

    #[account(mut, associated_token::mint = token_b_mint, associated_token::authority = token_mint_authority)]
    pub token_b_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_b_mint: Account<'info, Mint>,

    #[account(seeds = [b"token_mint_authority"], bump = bump)]
    pub token_mint_authority: AccountInfo<'info>,

    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,
}

impl<'info> SwapTokens<'info> {
    fn into_burn_context(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Burn {
                mint: self.token_a_mint.to_account_info(),
                from: self.token_a_account.to_account_info(),
                authority: self.token_a_owner.to_account_info(),
            },
        )
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("The provided amount must be greater than zero.")]
    InvalidAmount,
}
