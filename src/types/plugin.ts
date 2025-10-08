import {BaseParser} from "../architectures/parser";
import {BaseEmulator} from "../architectures/emulator";
import {BaseFormatter} from "../architectures/formatter";

export interface ArchitecturePlugin {
    name: string,
    parser: BaseParser,
    emulator: BaseEmulator,
    formatter: BaseFormatter,
}