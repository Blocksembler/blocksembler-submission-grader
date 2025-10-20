import amqp, {Channel, ChannelModel} from "amqplib";
import {RABBIT_MQ_URI} from "../config";


let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export async function getChannel(): Promise<Channel> {
    if (channel) return channel;

    connection = await amqp.connect(RABBIT_MQ_URI);
    channel = await connection.createChannel();

    await channel.prefetch(1);

    connection.on("close", () => {
        console.error("[MQ] RabbitMQ connection closed");
        process.exit(1);
    });

    connection.on("error", (err) => {
        console.error("[MQ] RabbitMQ connection error:", err);
        process.exit(1);
    });

    return channel;
}

export async function closeConnection() {
    if (channel) await channel.close();
    if (connection) await connection.close();
    channel = null;
    connection = null;
}
