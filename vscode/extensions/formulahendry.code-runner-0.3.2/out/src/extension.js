'use strict';
var vscode = require('vscode');
var codeManager_1 = require('./codeManager');
function activate(context) {
    console.log('Congratulations, your extension "code-runner" is now active!');
    var codeManager = new codeManager_1.CodeManager();
    var run = vscode.commands.registerCommand('code-runner.run', function () {
        codeManager.run();
    });
    var runByLanguage = vscode.commands.registerCommand('code-runner.runByLanguage', function () {
        codeManager.runByLanguage();
    });
    var stop = vscode.commands.registerCommand('code-runner.stop', function () {
        codeManager.stop();
    });
    context.subscriptions.push(run);
    context.subscriptions.push(runByLanguage);
    context.subscriptions.push(stop);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map