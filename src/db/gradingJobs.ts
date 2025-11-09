import {pool} from "./connection";
import {FAILED_SUBMISSION_PENALTY} from "../config";

const FAILED_EXERCISE_PROGRESS_UPDATE_QUERY = "UPDATE exercise_progress " +
    "SET next_grading_allowed_at=$2, failed_submissions=failed_submissions+1 " +
    "WHERE tan_code = (SELECT tan_code FROM grading_job WHERE id = $1) " +
    "AND exercise_id = (SELECT exercise_id FROM grading_job WHERE id = $1)";

const SUCCESSFUL_EXERCISE_PROGRESS_UPDATE_QUERY = "UPDATE exercise_progress " +
    "SET end_time=now() " +
    "WHERE tan_code = (SELECT tan_code FROM grading_job WHERE id = $1) " +
    "AND exercise_id = (SELECT exercise_id FROM grading_job WHERE id = $1)";

const UPDATE_GRADING_JOB_QUERY = "UPDATE grading_job SET status = 'done', terminated=now(), passed=$2, feedback=$3 WHERE id = $1";
const GET_TEST_CASES_QUERY = "SELECT * FROM test_case WHERE exercise_id = $1";

export interface TestCase {
    "title": string,
    "exercise_id": number,
    "precondition": SystemState,
    "postcondition": SystemState,
    "user_input": Array<string>,
    "expected_output": Array<string>,
}

export interface SystemState {
    "registers": Map<string, number>,
    "memory": Map<number, number>
}

export const updateGradingJob = async (gradingJobId: string, passed: boolean, logMessages: string[]) => {
    const client = await pool.connect();

    console.log(`${gradingJobId} - Start update transaction`);

    await client.query("BEGIN");
    await client.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");

    try {
        console.log(`${gradingJobId} - Update grading job table...`);

        let nextGradingDate = new Date(Date.now() + FAILED_SUBMISSION_PENALTY);

        await client.query(UPDATE_GRADING_JOB_QUERY, [gradingJobId, passed, JSON.stringify(logMessages)])

        if (passed) {
            console.log(`${gradingJobId} - Update exercise progress table...`);
            await client.query(SUCCESSFUL_EXERCISE_PROGRESS_UPDATE_QUERY, [gradingJobId])
        } else {
            await client.query(FAILED_EXERCISE_PROGRESS_UPDATE_QUERY, [gradingJobId, nextGradingDate])
        }

        console.log(`${gradingJobId} - Do commit...`);
        await client.query("COMMIT");
        console.log(`${gradingJobId} - Update successful!`);
    } catch (err) {
        console.log(err);
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

export const getTestCases = async (exerciseId: number) => {
    let result = await pool.query(GET_TEST_CASES_QUERY, [exerciseId])
    return result.rows as Array<TestCase>;
}

