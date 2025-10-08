import {BaseParser} from "../parser";
import {AnnaInstructionFactory} from "./instructions";
import {addressSize} from "./emulator";
import {Word} from "../emulator";
import {BaseInstruction} from "../instructions";

export class AnnaAssemblyParser extends BaseParser {
    constructor() {
        super(new AnnaInstructionFactory(), "#", " ", ":");
    }

    isLabelReference(arg: string): boolean {
        return arg.startsWith('&')
    }

    labelReferenceToName(arg: string): string {
        return arg.slice(1);
    }

    labelToVal(labelAddress: number, instructionAddress: number, instruction: BaseInstruction): number {
        const instStr = instruction.toString()

        if (instStr.startsWith("lli")) {
            const w = Word.fromSignedIntValue(labelAddress, addressSize);
            return parseInt(w.toBitString().slice(8, 16), 2)
        } else if (instStr.startsWith("lui")) {
            const w = Word.fromSignedIntValue(labelAddress, addressSize);
            return parseInt(w.toBitString().slice(0, 8), 2)
        }

        return labelAddress - instructionAddress - 1;
    }
}
