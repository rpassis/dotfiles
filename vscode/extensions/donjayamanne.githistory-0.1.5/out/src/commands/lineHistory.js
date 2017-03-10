"use strict";
const vscode = require('vscode');
const historyUtil = require('../helpers/historyUtils');
const path = require('path');
function run(outChannel) {
    if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document) {
        return;
    }
    if (!vscode.window.activeTextEditor.selection) {
        return;
    }
    historyUtil.getGitRepositoryPath(vscode.window.activeTextEditor.document.fileName).then((gitRepositoryPath) => {
        let relativeFilePath = path.relative(gitRepositoryPath, vscode.window.activeTextEditor.document.fileName);
        let currentLineNumber = vscode.window.activeTextEditor.selection.start.line + 1;
        historyUtil.getLineHistory(gitRepositoryPath, relativeFilePath, currentLineNumber).then(displayHistory, genericErrorHandler);
        function displayHistory(log) {
            if (log.length === 0) {
                vscode.window.showInformationMessage('There are no history items for this item "`${relativeFilePath}`".');
                return;
            }
            let itemPickList = log.map(item => {
                let dateTime = new Date(Date.parse(item.author_date)).toLocaleString();
                let label = `${item.author_name} <${item.author_email}> on ${dateTime}`;
                let description = item.message;
                return { label: label, description: description, data: item };
            });
            vscode.window.showQuickPick(itemPickList, { placeHolder: 'Select an item to view the change log', matchOnDescription: true }).then(item => {
                if (!item) {
                    return;
                }
                onItemSelected(item);
            });
        }
        function onItemSelected(item) {
            viewLog(item.data);
        }
        function viewLog(details) {
            let authorDate = new Date(Date.parse(details.author_date)).toLocaleString();
            let committerDate = new Date(Date.parse(details.commit_date)).toLocaleString();
            let log = `sha1 : ${details.sha1}\n` +
                `Author : ${details.author_name} <${details.author_email}>\n` +
                `Author Date : ${authorDate}\n` +
                `Committer Name : ${details.committer_name} <${details.committer_email}>\n` +
                `Commit Date : ${committerDate}\n` +
                `Message : ${details.message}`;
            outChannel.appendLine(log);
            outChannel.show();
        }
        function genericErrorHandler(error) {
            if (error.code && error.syscall && error.code === 'ENOENT' && error.syscall === 'spawn git') {
                vscode.window.showErrorMessage('Cannot find the git installation');
            }
            else {
                outChannel.appendLine(error);
                outChannel.show();
                vscode.window.showErrorMessage('There was an error, please view details in output log');
            }
        }
    });
}
exports.run = run;
//# sourceMappingURL=lineHistory.js.map