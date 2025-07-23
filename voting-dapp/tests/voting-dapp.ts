import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VotingDapp } from "../target/types/voting_dapp";
import { expect } from "chai";

describe("voting-dapp", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.votingDapp as Program<VotingDapp>;

  it("initializePoll", async () => {
    // Add your test here.
    try {
      const tx = await program.methods
        .initializePoll(
          new anchor.BN(2), // pollId
          "Test Poll", // pollName
          "This is a test poll", // description
          new anchor.BN(Date.now() / 1000 - 86400), // votingStart (1 day ago)
          new anchor.BN(Date.now() / 1000 + 86400) // votingEnd (1 day later)
        )
        .rpc();
      console.log("Your transaction signature", tx);
    } catch (error) {
      console.error("Error initializing poll:", error);
    }
  });

  it("initialize candidates", async () => {
    const pollIdBuffer = new anchor.BN(2).toArrayLike(Buffer, "le", 8);

    const [pollAddress] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), pollIdBuffer],
      program.programId
    );

    // Add your test here.
    try {
      const tx = await program.methods
        .initializeCandidate(new anchor.BN(2), "Candidate 1")
        .accounts({
          pollAccount: pollAddress,
        })
        .rpc();
      console.log("Your transaction signature for candidate 1", tx);
    } catch (error) {
      console.error("Error initializing candidate 1:", error);
    }

    try {
      const tx2 = await program.methods
        .initializeCandidate(new anchor.BN(2), "Candidate 2")
        .accounts({
          pollAccount: pollAddress,
        })
        .rpc();
      console.log("Your transaction signature for candidate 2", tx2);
    } catch (error) {
      console.error("Error initializing candidate 2:", error.getLogs);
    }
  });

  it("vote", async () => {
    try {
      const tx = await program.methods
        .vote(new anchor.BN(2), "Candidate 1")
        .rpc();

      console.log("Your transaction signature for voting", tx);
    } catch (error) {
      console.error("Error voting:", error);
    }

    //count of candidate 1 votes
    const candidateAccount = await program.account.candidate.fetch(
      anchor.web3.PublicKey.findProgramAddressSync(
        [
          new anchor.BN(2).toArrayLike(Buffer, "le", 8),
          new TextEncoder().encode("Candidate 1"),
        ],
        program.programId
      )[0]
    );

    expect(candidateAccount.candidateVotes.toNumber()).to.equal(1);
  });
});
