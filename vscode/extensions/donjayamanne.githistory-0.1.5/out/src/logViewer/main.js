'use strict';
const vscode = require('vscode');
const htmlGenerator = require('./htmlGenerator');
const gitHist = require('../helpers/gitHistory');
const path = require('path');
const gitHistorySchema = 'git-history-viewer';
const PAGE_SIZE = 500;
let previewUri = vscode.Uri.parse(gitHistorySchema + '://authority/git-history');
let historyRetrieved;
let pageIndex = 0;
let pageSize = PAGE_SIZE;
let canGoPrevious = false;
let canGoNext = true;
class TextDocumentContentProvider {
    constructor() {
        this._onDidChange = new vscode.EventEmitter();
    }
    provideTextDocumentContent(uri, token) {
        return gitHist.getHistory(vscode.workspace.rootPath, pageIndex, pageSize)
            .then(entries => {
            canGoPrevious = pageIndex > 0;
            canGoNext = entries.length === pageSize;
            this.entries = entries;
            let html = this.generateHistoryView();
            return html;
        }).catch(error => {
            return this.generateErrorView(error);
        });
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    update(uri) {
        this._onDidChange.fire(uri);
    }
    getStyleSheetPath(resourceName) {
        return vscode.Uri.file(path.join(__dirname, '..', '..', '..', 'resources', resourceName)).toString();
    }
    getScriptFilePath(resourceName) {
        return vscode.Uri.file(path.join(__dirname, '..', '..', 'src', 'browser', resourceName)).toString();
    }
    getNodeModulesPath(resourceName) {
        return vscode.Uri.file(path.join(__dirname, '..', '..', '..', 'node_modules', resourceName)).toString();
    }
    generateErrorView(error) {
        return `
            <head>
                <link rel="stylesheet" href="${this.getNodeModulesPath(path.join('normalize.css', 'normalize.css'))}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath(path.join('octicons', 'font', 'octicons.css'))}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('animate.min.css')}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('main.css')}" >
            </head>
            <body>
                ${htmlGenerator.generateErrorView(error)}
            </body>
        `;
    }
    generateHistoryView() {
        const innerHtml = htmlGenerator.generateHistoryHtmlView(this.entries, canGoPrevious, canGoNext);
        return `
            <head>
                <link rel="stylesheet" href="${this.getNodeModulesPath(path.join('normalize.css', 'normalize.css'))}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath(path.join('octicons', 'font', 'octicons.css'))}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('animate.min.css')}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('hint.min.css')}" >
                <link rel="stylesheet" href="${this.getStyleSheetPath('main.css')}" >
                <script src="${this.getNodeModulesPath(path.join('jquery', 'dist', 'jquery.min.js'))}"></script>
                <script src="${this.getNodeModulesPath(path.join('clipboard', 'dist', 'clipboard.min.js'))}"></script>
                <script src="${this.getScriptFilePath('proxy.js')}"></script>
                <script src="${this.getScriptFilePath('svgGenerator.js')}"></script>
                <script src="${this.getScriptFilePath('detailsView.js')}"></script>
            </head>

            <body>
                ${innerHtml}
            </body>
        `;
    }
}
function activate(context, outputChannel) {
    let provider = new TextDocumentContentProvider();
    let registration = vscode.workspace.registerTextDocumentContentProvider(gitHistorySchema, provider);
    let disposable = vscode.commands.registerCommand('git.viewHistory', () => {
        // Unique name everytime, so that we always refresh the history log
        // Untill we add a refresh button to the view
        historyRetrieved = false;
        pageIndex = 0;
        canGoPrevious = false;
        canGoNext = true;
        previewUri = vscode.Uri.parse(gitHistorySchema + '://authority/git-history?x=' + new Date().getTime().toString());
        return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.One, 'Git History (git log)').then((success) => {
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
    });
    context.subscriptions.push(disposable, registration);
    disposable = vscode.commands.registerCommand('git.copyText', (sha) => {
        vscode.window.showInformationMessage(sha);
    });
    disposable = vscode.commands.registerCommand('git.logNavigate', (direction) => {
        pageIndex = pageIndex + (direction === 'next' ? 1 : -1);
        provider.update(previewUri);
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
//# sourceMappingURL=main.js.map