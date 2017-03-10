"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const history = require('./commands/fileHistory');
const lineHistory = require('./commands/lineHistory');
const viewer = require('./logViewer/main');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    const outChannel = vscode.window.createOutputChannel('Git History');
    history.activate(outChannel);
    let disposable = vscode.commands.registerCommand('git.viewFileHistory', (fileUri) => {
        outChannel.clear();
        let fileName = '';
        if (fileUri && fileUri.fsPath) {
            fileName = fileUri.fsPath;
        }
        else {
            if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document) {
                return;
            }
            fileName = vscode.window.activeTextEditor.document.fileName;
        }
        history.run(fileName);
    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerTextEditorCommand('git.viewLineHistory', () => {
        outChannel.clear();
        lineHistory.run(outChannel);
    });
    context.subscriptions.push(disposable);
    viewer.activate(context, outChannel);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map