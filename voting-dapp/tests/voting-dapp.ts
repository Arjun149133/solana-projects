import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VotingDapp } from "../target/types/voting_dapp";

describe("voting-dapp", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.votingDapp as Program<VotingDapp>;

  it("Is initialized!", async () => {
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
});
