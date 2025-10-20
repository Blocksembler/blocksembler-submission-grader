import {pluginRegistry} from "./architectures/pluginRegistry";
import {closeConnection, getChannel} from "./mq/connection";
import {SubmissionGrader} from "./mq/consumer";

const ARCHITECTURE = process.env.ARCHITECTURE || "anna";
const architecturePlugin = pluginRegistry[ARCHITECTURE]


const startWorker = async () => {
    const channel = await getChannel();
    const grader = new SubmissionGrader(channel, architecturePlugin.emulator, architecturePlugin.parser);

    await grader.consumeGradingJobs();
}

startWorker().catch(async (err) => {
    console.error("Unexpected error:", err)
    await closeConnection()

    console.error("Shutting down...")
    process.exit(1)
})