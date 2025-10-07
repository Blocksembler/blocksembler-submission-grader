import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://blocksembler:blocksembler@localhost";
const JOB_QUEUE = "grading_jobs";

async function connectToMessageQueue(): Promise<void> {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(JOB_QUEUE, {durable: true});

        await channel.consume(JOB_QUEUE, (msg) => {
            if (msg) {
                console.log('Received message:', msg.content.toString());
                channel.ack(msg);

                let job = msg.content.toJSON()

                // TODO: grade message
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