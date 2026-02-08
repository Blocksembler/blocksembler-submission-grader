import {BaseEmulator, Word} from "../architectures/emulator";
import {BaseInstruction} from "../architectures/instructions";
import {Instruction} from "../architectures/types/emulator";
import {TestCase} from "../db/gradingJobs";
import {MAX_STEPS} from "../config";
import {mockUserInputs} from "../architectures/anna/emulator";


const prettyPrintEmulator = (emulator: BaseEmulator) => {
    let str = "EMULATOR STATE\n";
    for (const [key, val] of Object.entries(emulator.registers)) {
        str += `${key}: ${val.toSignedIntValue()} \n`;
    }

    str += "\n";

    str += "output: \n";
    str += JSON.stringify(emulator.output, null, 2) + "\n";

    return str;
}

const prettyPrintProgram = (program: Instruction[]) => {
    let str = "PROGRAM \n";
    for (let i = 0; i < program.length; i++) {
        str += `${i}: ${program[i].labels} ${program[i].toString()} \n`;
    }
    return str;
}

export class Grader {
    private readonly emulator: BaseEmulator;
    private readonly program: BaseInstruction[];

    constructor(emulator: BaseEmulator, program: Instruction[]) {
        this.emulator = emulator;
        this.program = program;
    }

    public doGrading(testCases: TestCase[]) {
        for (const tc of testCases) {
            if (!this.runTestCase(tc)) {
                return false;
            }
        }
        return true;
    }

    private runTestCase(tc: TestCase): boolean {

        this.setupTestCasePrecondition(tc);

        console.debug(prettyPrintProgram(this.program))

        console.debug(prettyPrintEmulator(this.emulator))


        this.emulator.loadProgram(this.program);

        let stepCount = 0;

        console.debug("Running test case");

        let instructionTrace: Array<string> = [];

        let stepLimit = MAX_STEPS;

        if (tc.step_limit && tc.step_limit > 0 && tc.step_limit < MAX_STEPS) {
            stepLimit = tc.step_limit
        }

        console.log(`Step Limit: ${stepLimit}`);

        while (!this.emulator.isTerminated && stepCount < stepLimit) {
            const currentPC = this.emulator.registers.pc.toUnsignedIntValue();
            const nextInstruction = this.emulator.loadInstructionAt(currentPC);
            instructionTrace.push(nextInstruction.toString().split(' ')[0]);

            this.emulator.executeSingleInstruction();

            stepCount++;
        }

        if (stepCount == stepLimit) {
            console.warn("Maximum step count reached");
            return false;
        }

        console.debug(prettyPrintEmulator(this.emulator))

        let allExpectedInstructionsExecuted = true;

        for (let mnemonic of tc.expected_instructions) {
            if (!instructionTrace.includes(mnemonic)) {
                allExpectedInstructionsExecuted = false;
                console.debug(`expected instruction '${mnemonic}' was not executed!`);
            }
        }

        let expectedOutputGenerated = JSON.stringify(tc.expected_output) === JSON.stringify(this.emulator.output);

        if (!expectedOutputGenerated) {
            console.debug(`Expected emulator output to be: [${tc.expected_output.toString()}] but was [${this.emulator.output.toString()}]`)
        }

        return expectedOutputGenerated && allExpectedInstructionsExecuted && this.checkPostCondition(tc);
    }

    private setupTestCasePrecondition(tc: TestCase) {
        this.emulator.resetMemory();
        this.emulator.resetRegisters();
        this.emulator.output.splice(0, this.emulator.output.length);
        mockUserInputs.splice(0, mockUserInputs.length);

        this.emulator.isTerminated = false;

        tc.user_input
            .map(val => parseInt(val))
            .forEach(intVal => mockUserInputs.push(intVal));

        for (const [key, val] of Object.entries(tc.precondition.registers)) {
            if (key in this.emulator.registers) {
                this.emulator.registers[key].set(Word.fromSignedIntValue(val, this.emulator.addressSize));
            } else {
                console.warn(`Register ${key} not found in emulator`);
            }
        }

        for (const [key, val] of Object.entries(tc.precondition.memory)) {
            if (key in this.emulator.memory) {
                this.emulator.memory[parseInt(key)].value.set(Word.fromSignedIntValue(val, this.emulator.addressSize));
            } else {
                console.warn(`Memory Address ${key} not found in emulator`);
            }
        }
    }

    private checkPostCondition(tc: TestCase): boolean {
        for (const [key, val] of Object.entries(tc.postcondition.registers)) {
            if (key in this.emulator.registers) {
                if (this.emulator.registers[key].toSignedIntValue() !== val) {
                    console.info(`Register ${key} has value ${this.emulator.registers[key].toSignedIntValue()} instead of ${val}`);
                    return false;
                }
            } else {
                console.error(`Register ${key} not found in emulator`);
                return false;
            }
        }

        for (const [key, val] of Object.entries(tc.postcondition.memory)) {
            if (key in this.emulator.memory) {
                if (this.emulator.memory[parseInt(key)].value.toSignedIntValue() !== val) {

                    console.info(`Memory at address ${key} has value ${this.emulator.memory[Number(key)]} instead of ${val}`);
                    return false;
                }
            } else {
                console.error(`Memory location ${key} not found in emulator`);
                return false;
            }
        }

        return true;
    }
}