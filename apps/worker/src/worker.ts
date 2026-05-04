import { Worker } from "@temporalio/worker";
import * as activities from "../../../packages/workflows/src/activities";

async function run() {
  const worker = await Worker.create({
    workflowsPath: require.resolve("../../../packages/workflows/src/hotelWorkflow"),
    activities,
    taskQueue: "hotel-task-queue",
  });

  await worker.run();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});