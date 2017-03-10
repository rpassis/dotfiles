"use strict";
const vscode = require("vscode");
function systemPrune() {
    let terminal = vscode.window.createTerminal("docker system prune");
    terminal.sendText(`docker system prune -f`);
    terminal.show();
}
exports.systemPrune = systemPrune;
//# sourceMappingURL=system-prune.js.map