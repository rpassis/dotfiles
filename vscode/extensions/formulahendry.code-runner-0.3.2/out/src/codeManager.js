'use strict';
var vscode = require('vscode');
var path_1 = require('path');
var os = require('os');
var fs = require('fs');
var appInsightsClient_1 = require('./appInsightsClient');
var TmpDir = os.tmpdir();
var CodeManager = (function () {
    function CodeManager() {
        this._outputChannel = vscode.window.createOutputChannel('Code');
        this._appInsightsClient = new appInsightsClient_1.AppInsightsClient();
    }
    CodeManager.prototype.run = function (languageId) {
        if (languageId === void 0) { languageId = null; }
        if (this._isRunning) {
            vscode.window.showInformationMessage('Code is already running!');
            return;
        }
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No code found or selected.');
            return;
        }
        this.initialize(editor);
        var fileExtension = this.getFileExtension(editor);
        var executor = this.getExecutor(languageId, fileExtension);
        // undefined or null
        if (executor == null) {
            vscode.window.showInformationMessage('Code language not supported or defined.');
            return;
        }
        this.getCodeFileAndExecute(editor, fileExtension, executor);
    };
    CodeManager.prototype.runByLanguage = function () {
        var _this = this;
        this._appInsightsClient.sendEvent('runByLanguage');
        vscode.window.showInputBox({ prompt: "Enter language: e.g. php, javascript, bat, shellscript..." }).then(function (languageId) {
            if (languageId !== undefined) {
                _this.run(languageId);
            }
        });
    };
    CodeManager.prototype.stop = function () {
        this._appInsightsClient.sendEvent('stop');
        if (this._isRunning) {
            this._isRunning = false;
            var kill = require('tree-kill');
            kill(this._process.pid);
        }
    };
    CodeManager.prototype.initialize = function (editor) {
        this._config = vscode.workspace.getConfiguration('code-runner');
        this._cwd = this._config.get('cwd');
        if (this._cwd) {
            return;
        }
        if (this._config.get('fileDirectoryAsCwd') && !editor.document.isUntitled) {
            this._cwd = path_1.dirname(editor.document.fileName);
        }
        else {
            this._cwd = vscode.workspace.rootPath;
        }
        if (this._cwd) {
            return;
        }
        this._cwd = TmpDir;
    };
    CodeManager.prototype.getCodeFileAndExecute = function (editor, fileExtension, executor) {
        var _this = this;
        var selection = editor.selection;
        if (selection.isEmpty && !editor.document.isUntitled) {
            this._isTmpFile = false;
            this._codeFile = editor.document.fileName;
            if (this._config.get('saveFileBeforeRun')) {
                return editor.document.save().then(function () {
                    _this.executeCommand(executor);
                });
            }
        }
        else {
            var text = selection.isEmpty ? editor.document.getText() : editor.document.getText(selection);
            if (this._languageId === "php") {
                text = text.trim();
                if (!text.startsWith("<?php")) {
                    text = "<?php\r\n" + text;
                }
            }
            this._isTmpFile = true;
            var folder = editor.document.isUntitled ? this._cwd : path_1.dirname(editor.document.fileName);
            this.createRandomFile(text, folder, fileExtension);
        }
        this.executeCommand(executor);
    };
    CodeManager.prototype.rndName = function () {
        return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
    };
    CodeManager.prototype.createRandomFile = function (content, folder, fileExtension) {
        var fileType = "";
        var languageIdToFileExtensionMap = this._config.get('languageIdToFileExtensionMap');
        if (languageIdToFileExtensionMap[this._languageId]) {
            fileType = languageIdToFileExtensionMap[this._languageId];
        }
        else {
            if (fileExtension) {
                fileType = fileExtension;
            }
            else {
                fileType = '.' + this._languageId;
            }
        }
        var tmpFileName = 'temp-' + this.rndName() + fileType;
        this._codeFile = path_1.join(folder, tmpFileName);
        fs.writeFileSync(this._codeFile, content);
    };
    CodeManager.prototype.getExecutor = function (languageId, fileExtension) {
        this._languageId = languageId === null ? vscode.window.activeTextEditor.document.languageId : languageId;
        var executorMap = this._config.get('executorMap');
        var executor = executorMap[this._languageId];
        // executor is undefined or null
        if (executor == null && fileExtension) {
            var executorMapByFileExtension = this._config.get('executorMapByFileExtension');
            executor = executorMapByFileExtension[fileExtension];
            if (executor != null) {
                this._languageId = fileExtension;
            }
        }
        if (executor == null) {
            this._languageId = this._config.get('defaultLanguage');
            executor = executorMap[this._languageId];
        }
        return executor;
    };
    CodeManager.prototype.getFileExtension = function (editor) {
        var fileName = editor.document.fileName;
        var index = fileName.lastIndexOf(".");
        if (index !== -1) {
            return fileName.substr(index);
        }
        else {
            return "";
        }
    };
    CodeManager.prototype.executeCommand = function (executor) {
        var _this = this;
        this._isRunning = true;
        var clearPreviousOutput = this._config.get('clearPreviousOutput');
        if (clearPreviousOutput) {
            this._outputChannel.clear();
        }
        this._outputChannel.show();
        var exec = require('child_process').exec;
        var command = executor + ' \"' + this._codeFile + '\"';
        this._outputChannel.appendLine('[Running] ' + command);
        this._appInsightsClient.sendEvent(executor);
        var startTime = new Date();
        this._process = exec(command, { cwd: this._cwd });
        this._process.stdout.on('data', function (data) {
            _this._outputChannel.append(data);
        });
        this._process.stderr.on('data', function (data) {
            _this._outputChannel.append(data);
        });
        this._process.on('close', function (code) {
            _this._isRunning = false;
            var endTime = new Date();
            var elapsedTime = (endTime.getTime() - startTime.getTime()) / 1000;
            _this._outputChannel.appendLine('');
            _this._outputChannel.appendLine('[Done] exited with code=' + code + ' in ' + elapsedTime + ' seconds');
            _this._outputChannel.appendLine('');
            if (_this._isTmpFile) {
                fs.unlink(_this._codeFile);
            }
        });
    };
    return CodeManager;
}());
exports.CodeManager = CodeManager;
//# sourceMappingURL=codeManager.js.map