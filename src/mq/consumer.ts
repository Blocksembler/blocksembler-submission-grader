import {Channel, ConsumeMessage} from "amqplib";
import {getTestCases, updateGradingJob} from "../db/gradingJobs";
import {BaseInstruction} from "../architectures/instructions";
import {BaseEmulator} from "../architectures/emulator";
import {BaseParser} from "../architectures/parser";
import {Grader} from "../grader/grader";
import {GRADING_JOB_QUEUE} from "../config";


export interface GradingJobMessage {
    "job_id": string,
    "exercise_id": number,
    "tan_code": string,
    "solution_code": string
}

const isGradingJobMessage = (msg: any): msg is GradingJobMessage => {
    return msg && msg.hasOwnProperty("job_id")
        && msg.hasOwnProperty("exercise_id")
        && msg.hasOwnProperty("tan_code")
        && msg.hasOwnProperty("solution_code");
}

export class SubmissionGrader {
    private channel: Channel;
    private parser: BaseParser;
    private readonly emulator: BaseEmulator;

    constructor(channel: Channel, emulator: BaseEmulator, parser: BaseParser) {
        this.channel = channel;
        this.emulator = emulator;
        this.parser = parser;
    }

    consumeGradingJobs = async () => {
        await this.channel.consume(GRADING_JOB_QUEUE, async (msg: ConsumeMessage | null): Promise<void> => {
            if (!msg) {
                console.warn("Received a null message.");
                return
            }

            let gradingJob = JSON.parse(msg.content.toString());
            let logMessages: Array<string> = [];

            if (!isGradingJobMessage(gradingJob)) {
                console.warn("Received a message that is not a grading job.");
                this.channel.ack(msg);
                return;
            }

            console.log("grading job received:", gradingJob.job_id)

            console.debug(JSON.stringify(gradingJob, null, 2));

            logMessages.push("grading job received");

            let program: Array<BaseInstruction>;

            try {
                program = this.parser.parseCode(gradingJob.solution_code, true);
                logMessages.push("parsing successful");
            } catch (err) {
                console.error("parsing failed:", err);
                logMessages.push(`parsing failed: ${err}`);
                await updateGradingJob(gradingJob.job_id, false, logMessages);
                this.channel.ack(msg);
                return;
            }

            const testCases = await getTestCases(gradingJob.exercise_id);
            const testCaseRunner = new Grader(this.emulator, program);

            if (!testCaseRunner.doGrading(testCases)) {
                console.log("Some test cases failed");
                logMessages.push("Some test cases failed");

                await updateGradingJob(gradingJob.job_id, false, logMessages);
                this.channel.ack(msg);
                return
            }

            console.log("All test cases passed");
            logMessages.push("All test cases passed");

            await updateGradingJob(gradingJob.job_id, true, logMessages);
            this.channel.ack(msg);
        });
    }
}