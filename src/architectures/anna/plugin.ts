import {AnnaEmulator} from "./emulator";
import {AnnaAssemblyParser} from "./parser";
import {AnnaCodeFormatter} from "./formatter";
import {ArchitecturePlugin} from "../../types/plugin";

export default {
    name: "anna",
    parser: new AnnaAssemblyParser(),
    emulator: new AnnaEmulator(),
    formatter: new AnnaCodeFormatter()
} satisfies ArchitecturePlugin;