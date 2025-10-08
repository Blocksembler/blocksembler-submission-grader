import {BaseEmulator} from "./emulator";

export class BaseInstruction {
    args: Array<string>;
    labels: Array<string>;
    comment: string;

    constructor(args: Array<string> = [], labels: Array<string> = [], comment: string = "") {
        this.args = args;
        this.labels = labels;
        this.comment = comment;
    }

    static fromMachineCode(_code: string): BaseInstruction {
        throw Error("Not implemented");
    }

    toString(): string {
        return "";
    }

    toMachineCode(): string {
        return "";
    }

    executeOn(_e: BaseEmulator): void {
        throw new Error("Not implemented");
    }
}

export class MultilineComment extends BaseInstruction {
    text: string;

    constructor(text: string) {
        super([], [], "");
        this.text = text;
    }

    toString() {
        return this.text;
    }

    toMachineCode() {
        return "";
    }
}