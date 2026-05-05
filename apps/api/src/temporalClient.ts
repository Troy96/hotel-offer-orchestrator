import { Connection, Client } from "@temporalio/client";

export async function getTemporalClient() {
  const connection = await Connection.connect({
    address: process.env.TEMPORAL_ADDRESS || "127.0.0.1:7233",
  });

  return new Client({ connection });
}