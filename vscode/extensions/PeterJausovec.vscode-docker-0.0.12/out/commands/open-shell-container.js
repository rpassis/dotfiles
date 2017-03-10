"use strict";
const vscode = require("vscode");
const quick_pick_container_1 = require("./utils/quick-pick-container");
const docker_endpoint_1 = require("./utils/docker-endpoint");
const engineTypeShellCommands = {
    [docker_endpoint_1.DockerEngineType.Linux]: "/bin/sh",
    [docker_endpoint_1.DockerEngineType.Windows]: "powershell"
};
function openShellContainer() {
    quick_pick_container_1.quickPickContainer().then((selectedItem) => {
        if (selectedItem) {
            docker_endpoint_1.docker.getEngineType().then((engineType) => {
                const terminal = vscode.window.createTerminal(`Shell: ${selectedItem.label}`);
                terminal.sendText(`docker exec -it ${selectedItem.ids[0]} ${engineTypeShellCommands[engineType]}`);
                terminal.show();
            });
        }
    });
}
exports.openShellContainer = openShellContainer;
//# sourceMappingURL=open-shell-container.js.map