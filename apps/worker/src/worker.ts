import { Worker, NativeConnection } from "@temporalio/worker";
import * as activities from "../../../packages/workflows/src/activities";

async function run() {
    const connection = await connectTemporalWithRetry();

  const worker = await Worker.create({
    connection,
    workflowsPath: require.resolve("../../../packages/workflows/src/hotelWorkflow"),
    activities,
    taskQueue: "hotel-task-queue",
  });

  console.log("Worker started");
  await worker.run();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

async function connectTemporalWithRetry(retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      return await NativeConnection.connect({
        address: process.env.TEMPORAL_ADDRESS || "127.0.0.1:7233",
      });
    } catch (err) {
      console.log("Retrying Temporal connection...");
      await new Promise(res => setTimeout(res, 2000));
    }
  }
  throw new Error("Failed to connect to Temporal");
}