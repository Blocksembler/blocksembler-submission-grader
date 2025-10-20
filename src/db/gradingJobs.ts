import {pool} from "./connection";

const UPDATE_EXERCISE_PROGRESS_QUERY = "UPDATE exercise_progress " +
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
    try {
        console.log(`${gradingJobId} - Update grading job table...`);
        await client.query(UPDATE_GRADING_JOB_QUERY, [gradingJobId, passed, JSON.stringify(logMessages)])

        if (passed) {
            console.log(`${gradingJobId} - Update exercise progress table...`);
            await client.query(UPDATE_EXERCISE_PROGRESS_QUERY, [gradingJobId])
        }

        console.log(`${gradingJobId} - Do commit...`);
        await client.query("COMMIT");
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }

    console.log(`${gradingJobId} - Update successful!`);
}

export const getTestCases = async (exerciseId: number) => {
    let result = await pool.query(GET_TEST_CASES_QUERY, [exerciseId])
    return result.rows as Array<TestCase>;
}

