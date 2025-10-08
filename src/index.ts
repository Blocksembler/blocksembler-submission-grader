import amqp from "amqplib";
import {pluginRegistry} from "./architectures/pluginRegistry";
import {Client} from "pg";

const DB_URI = process.env.DB_URI || "postgres://postgres:postgres@localhost/blocksembler";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://blocksembler:blocksembler@localhost";
const ARCHITECTURE = process.env.ARCHITECTURE || "anna";

const JOB_QUEUE = "grading_jobs";
const RESULT_QUEUE_PREFIX = "grading_response";

const architecturePlugin = pluginRegistry[ARCHITECTURE]

export interface GradingJobMessage {
    "job_id": string,
    "exercise_id": number,
    "tan_code": string,
    "solution_code": string
}

async function connectToMessageQueue(): Promise<void> {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(JOB_QUEUE, {durable: true});

        await channel.consume(JOB_QUEUE, async (msg) => {
            if (msg) {
                const gradingJob = JSON.parse(msg.content.toString()) as GradingJobMessage;
                console.log(`job ${gradingJob.job_id} received!`);

                const parser = architecturePlugin.parser;

                try {
                    parser.parseCode(gradingJob.solution_code);
                    channel.sendToQueue(`${RESULT_QUEUE_PREFIX}.${gradingJob.job_id}`, Buffer.from("Parsing assembly code successful..."));
                } catch (err: Error | any) {
                    console.error(err);
                    channel.sendToQueue(`${RESULT_QUEUE_PREFIX}.${gradingJob.job_id}`, Buffer.from(`Parsing failed: ${err.message}`));
                }

                try {
                    const client = new Client(DB_URI);
                    await client.connect()
                    await client.query("UPDATE grading_job SET status = 'done', terminated=now() WHERE id = $1", [gradingJob.job_id]);
                    await client.end();
                    channel.ack(msg);
                } catch (err) {
                    console.error(err);
                }
            }
        });
    } catch (err) {
        console.error(err);
        throw err;
    }
}

connectToMessageQueue().catch((err) => {
    console.error("Grader terminated due to unexpected error.");
    console.error(err);
    process.exit(1);
})