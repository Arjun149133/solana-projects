import {
  ActionGetResponse,
  ActionPostRequest,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
} from "@solana/actions";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { NextRequest } from "next/server";
import { VotingDapp } from "@/../target/types/voting_dapp";
import { BN, Program } from "@coral-xyz/anchor";
import fs from "fs";
import path from "path";

const idlpath = path.resolve(process.cwd(), "../target/idl/voting_dapp.json");
const IDL = JSON.parse(fs.readFileSync(idlpath, "utf8")) as VotingDapp;

export const OPTIONS = GET;

export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    title: "Favorite Cricket Player",
    description:
      "Vote for your favorite cricket player between Ab de Villiers and Virat Kohli.",
    icon: "https://imgs.search.brave.com/KIJnSA4-XIxUVjqyhbjbcog-GL7svhi4_Xp4wTsfMJs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvOTUz/MzY3My5qcGc",
    label: "Vote",
    links: {
      actions: [
        {
          type: "transaction",
          label: "Vote for AB de Villiers",
          href: "http://localhost:3000/api/vote?player=ab_de_villiers",
        },
        {
          type: "transaction",
          label: "Vote for Virat Kohli",
          href: "http://localhost:3000/api/vote?player=virat_kohli",
        },
      ],
    },
  };

  return Response.json(actionMetadata, {
    headers: ACTIONS_CORS_HEADERS,
  });
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const player = url.searchParams.get("player");

  if (player !== "ab_de_villiers" && player !== "virat_kohli") {
    return new Response("Invalid player", {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }

  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const program: Program<VotingDapp> = new Program(IDL, { connection });
  const body: ActionPostRequest = await req.json();
  let voter;

  try {
    voter = new PublicKey(body.account);
  } catch (error) {
    return new Response("Invalid account", {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }

  let candidate;
  if (player === "ab_de_villiers") {
    candidate = "Candidate 1";
  } else {
    candidate = "Candidate 2";
  }

  const instructions = await program.methods
    .vote(new BN(1), candidate)
    .accounts({
      voter: voter,
    })
    .transaction();

  const blockhash = await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: voter,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
  }).add(instructions);

  const response = await createPostResponse({
    fields: {
      type: "transaction",
      transaction: transaction,
    },
  });

  return Response.json(response, {
    headers: ACTIONS_CORS_HEADERS,
  });
}
