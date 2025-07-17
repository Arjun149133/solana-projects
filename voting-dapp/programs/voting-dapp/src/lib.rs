use anchor_lang::prelude::*;

declare_id!("AWFGqGr4TpdDhWvSSDbx2fWwqQdsRGkjVMLoWpLdbPPe");

#[program]
pub mod voting_dapp {
    use super::*;

    pub fn initialize_poll(
        ctx: Context<InitializePoll>,
        _poll_id: u64,
        poll_name: String,
        description: String,
        voting_start: u64,
        voting_end: u64,
    ) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        poll.poll_name = poll_name;
        poll.description = description;
        poll.voting_start = voting_start;
        poll.voting_end = voting_end;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = 8 + Poll::INIT_SPACE,
        seeds = [b"poll".as_ref(), poll_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub poll: Account<'info, Poll>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Poll {
    #[max_len(32)]
    pub poll_name: String,
    #[max_len(280)]
    pub description: String,
    pub voting_start: u64,
    pub voting_end: u64,
    pub poll_option_index: u64,
}
