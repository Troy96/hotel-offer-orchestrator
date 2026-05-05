import { Worker, NativeConnection } from "@temporalio/worker";
import * as activities from "../../../packages/workflows/src/activities";

async function run() {
    const connection = await NativeConnection.connect({
        address: "127.0.0.1:7233", // force IPv4
    });

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