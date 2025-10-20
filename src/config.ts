export const ARCHITECTURE = process.env.BLOCKSEMBLER_ARCHITECTURE || 'anna';

export const DB_URI = process.env.BLOCKSEMBLER_DB_URI || "postgres://postgres:postgres@localhost/blocksembler";

export const RABBIT_MQ_URI = process.env.BLOCKSEMBLER_MQ_URI || 'amqp://blocksembler:blocksembler@localhost:5672';
export const GRADING_JOB_QUEUE = process.env.BLOCKSEMBLER_GRADING_JOB_QUEUE || "grading-jobs";

export const MAX_STEPS = parseInt(process.env.BLOCKSEMBLER_GRADER_MAX_STEPS || "100000");
