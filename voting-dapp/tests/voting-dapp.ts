import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VotingDapp } from "../target/types/voting_dapp";
import { expect } from "chai";

describe("voting-dapp", () => {
  const provider = anchor.AnchorProvider.local()
  anchor.setProvider(provider);

  const program = anchor.workspace.votingDapp as Program<VotingDapp>;

  it("initializePoll", async () => {
    // Add your test here.
    const tx = await program.methods.initializePoll(
      new anchor.BN(1), // pollId
      "Test Poll", // pollName
      "This is a test poll", // description
      new anchor.BN(Date.now() / 1000), // votingStart
      new anchor.BN(Date.now() / 1000 + 86400) // votingEnd (1 day later)
    ).rpc();
    console.log("Your transaction signature", tx);
  });

  it("initialize candidates", async () => {
    const pollIdBuffer = new anchor.BN(1).toArrayLike(Buffer, "le", 8);

    const [pollAddress] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), pollIdBuffer],
      program.programId
    )

    // Add your test here.
    const tx = await program.methods.initializeCandidate(
      new anchor.BN(1), 
      "Candidate 1", 
    ).accounts({
      pollAccount: pollAddress,
    }).rpc();

    const tx2 = await program.methods.initializeCandidate(
      new anchor.BN(1), 
      "Candidate 2", 
    ).accounts({
      pollAccount: pollAddress,
    }).rpc();

    console.log("Your transaction signature for candidate 1", tx);
    console.log("Your transaction signature for candidate 2", tx2);
  })

  it("vote", async () => {
    const tx = await program.methods.vote(
      new anchor.BN(1), 
      "Candidate 1",
    ).rpc()

    console.log("Your transaction signature for voting", tx);

    //count of candidate 1 votes
    const candidateAccount = await program.account.candidate.fetch(
      anchor.web3.PublicKey.findProgramAddressSync(
        [new anchor.BN(1).toArrayLike(Buffer, "le", 8), new TextEncoder().encode("Candidate 1")],
        program.programId
      )[0]
    );

    expect(candidateAccount.candidateVotes.toNumber()).to.equal(1);
  })
});
