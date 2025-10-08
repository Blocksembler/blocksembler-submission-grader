import anna from "./anna/plugin"
import {ArchitecturePlugin} from "../types/plugin";

let plugins: Array<ArchitecturePlugin> = [anna];
export const pluginRegistry: Record<string, ArchitecturePlugin> = {};

for (const plugin of plugins) {
    pluginRegistry[plugin.name] = plugin;
}