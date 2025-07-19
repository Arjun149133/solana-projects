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

    pub fn initialize_candidate(
        ctx: Context<InitializeCandidate>,
        _poll_id: u64,
        candidate_name: String,
    ) -> Result<()> {
        let candidate = &mut ctx.accounts.candidate;
        candidate.candidate_name = candidate_name;
        candidate.candidate_votes = 0;
        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, _poll_id: u64, candidate_name: String) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        let candidate = &mut ctx.accounts.candidate;

        let current_time = Clock::get()?.unix_timestamp as u64;
        require!(
            current_time >= poll.voting_start,
            CustomError::VotingNotStarted
        );
        require!(current_time <= poll.voting_end, CustomError::VotingEnded);

        candidate.candidate_votes += 1;
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

#[derive(Accounts)]
#[instruction(poll_id: u64, candidate_name: String)]
pub struct InitializeCandidate<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    pub poll_account: Account<'info, Poll>,

    #[account(
        init,
        payer = signer,
        space = 8 + Candidate::INIT_SPACE,
        seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()],
        bump,
    )]
    pub candidate: Account<'info, Candidate>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(poll_id: u64, candidate_name: String)]
pub struct Vote<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,

    #[account(
        mut,
        seeds = [b"poll".as_ref(), poll_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()],
        bump,
    )]
    pub candidate: Account<'info, Candidate>,

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

#[account]
#[derive(InitSpace)]
pub struct Candidate {
    #[max_len(32)]
    pub candidate_name: String,
    pub candidate_votes: u64,
}

#[error_code]
pub enum CustomError {
    #[msg("Voting has not started yet.")]
    VotingNotStarted,

    #[msg("Voting has ended.")]
    VotingEnded,
}
