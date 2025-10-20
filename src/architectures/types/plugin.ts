import {BaseParser} from "../parser";
import {BaseEmulator} from "../emulator";
import {BaseFormatter} from "../formatter";

export interface ArchitecturePlugin {
    name: string,
    parser: BaseParser,
    emulator: BaseEmulator,
    formatter: BaseFormatter,
}