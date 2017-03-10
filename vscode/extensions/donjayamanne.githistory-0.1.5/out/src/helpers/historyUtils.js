"use strict";
const vscode = require('vscode');
const parser = require('../logParser');
const fs = require('fs');
const path = require('path');
const child_process_1 = require('child_process');
function getGitPath() {
    return new Promise((resolve, reject) => {
        let gitPath = vscode.workspace.getConfiguration('git').get('path');
        if (typeof gitPath === 'string' && gitPath.length > 0) {
            if (fs.existsSync(gitPath)) {
                resolve(gitPath);
                return;
            }
        }
        if (process.platform !== 'win32') {
            // Default: search in PATH environment variable
            resolve('git');
            return;
        }
        else {
            // in Git for Windows, the recommendation is not to put git into the PATH.
            // Instead, there is an entry in the Registry.
            let regQueryInstallPath = (location, view) => {
                return new Promise((resolve, reject) => {
                    let callback = function (error, stdout, stderr) {
                        if (error && error.code !== 0) {
                            error.stdout = stdout.toString();
                            error.stderr = stderr.toString();
                            reject(error);
                            return;
                        }
                        let installPath = stdout.toString().match(/InstallPath\s+REG_SZ\s+([^\r\n]+)\s*\r?\n/i)[1];
                        if (installPath) {
                            resolve(installPath + '\\bin\\git');
                        }
                        else {
                            reject();
                        }
                    };
                    let viewArg = '';
                    switch (view) {
                        case '64':
                            viewArg = '/reg:64';
                            break;
                        case '32':
                            viewArg = '/reg:64';
                            break;
                        default: break;
                    }
                    child_process_1.exec('reg query ' + location + ' ' + viewArg, callback);
                });
            };
            let queryChained = (locations) => {
                return new Promise((resolve, reject) => {
                    if (locations.length === 0) {
                        reject('None of the known git Registry keys were found');
                        return;
                    }
                    let location = locations[0];
                    regQueryInstallPath(location.key, location.view).then((location) => resolve(location), (error) => queryChained(locations.slice(1)).then((location) => resolve(location), (error) => reject(error)));
                });
            };
            queryChained([
                { 'key': 'HKCU\\SOFTWARE\\GitForWindows', 'view': null },
                { 'key': 'HKLM\\SOFTWARE\\GitForWindows', 'view': null },
                { 'key': 'HKCU\\SOFTWARE\\GitForWindows', 'view': '64' },
                { 'key': 'HKLM\\SOFTWARE\\GitForWindows', 'view': '64' },
                { 'key': 'HKCU\\SOFTWARE\\GitForWindows', 'view': '32' },
                { 'key': 'HKLM\\SOFTWARE\\GitForWindows', 'view': '32' }]).
                then((path) => resolve(path), 
            // fallback: PATH
                (error) => resolve('git'));
        }
    });
}
exports.getGitPath = getGitPath;
function getGitRepositoryPath(fileName) {
    return getGitPath().then((gitExecutable) => new Promise((resolve, reject) => {
        let directory = fs.statSync(fileName).isDirectory() ? fileName : path.dirname(fileName);
        let options = { cwd: directory };
        // git rev-parse --git-dir
        let ls = child_process_1.spawn(gitExecutable, ['rev-parse', '--show-toplevel'], options);
        let log = '';
        let error = '';
        ls.stdout.on('data', function (data) {
            log += data + '\n';
        });
        ls.stderr.on('data', function (data) {
            error += data;
        });
        ls.on('error', function (error) {
            console.error(error);
            reject(error);
            return;
        });
        ls.on('close', function () {
            if (error.length > 0) {
                reject(error);
                return;
            }
            let repositoryPath = log.trim();
            if (!path.isAbsolute(repositoryPath))
                repositoryPath = path.join(path.dirname(fileName), repositoryPath);
            resolve(repositoryPath);
        });
    }));
}
exports.getGitRepositoryPath = getGitRepositoryPath;
function getFileHistory(rootDir, relativeFilePath) {
    return getLog(rootDir, ['--max-count=50', '--decorate=full', '--date=default', '--pretty=fuller', '--parents', '--numstat', '--topo-order', '--raw', '--follow', '--', relativeFilePath]);
}
exports.getFileHistory = getFileHistory;
function getFileHistoryBefore(rootDir, relativeFilePath, isoStrictDateTime) {
    return getLog(rootDir, [`--max-count=10`, '--decorate=full', '--date=default', '--pretty=fuller', '--all', '--parents', '--numstat', '--topo-order', '--raw', '--follow', `--before='${isoStrictDateTime}'`, '--', relativeFilePath]);
}
exports.getFileHistoryBefore = getFileHistoryBefore;
function getLineHistory(rootDir, relativeFilePath, lineNumber) {
    let lineArgs = '-L' + lineNumber + ',' + lineNumber + ':' + relativeFilePath.replace(/\\/g, '/');
    return getLog(rootDir, [lineArgs, '--max-count=50', '--decorate=full', '--date=default', '--pretty=fuller', '--numstat', '--topo-order', '--raw']);
}
exports.getLineHistory = getLineHistory;
function getLog(rootDir, args) {
    return getGitPath().then((gitExecutable) => new Promise((resolve, reject) => {
        let options = { cwd: rootDir };
        args.unshift('log');
        let ls = child_process_1.spawn(gitExecutable, args, options);
        let log = '';
        let error = '';
        ls.stdout.on('data', function (data) {
            log += data + '\n';
        });
        ls.stderr.on('data', function (data) {
            error += data;
        });
        ls.on('error', function (error) {
            console.error(error);
            reject(error);
            return;
        });
        ls.on('close', function () {
            if (error.length > 0) {
                reject(error);
                return;
            }
            let parsedLog = parser.parseLogContents(log);
            resolve(parsedLog);
        });
    }));
}
function writeFile(rootDir, commitSha1, sourceFilePath, targetFile) {
    return getGitPath().then((gitExecutable) => new Promise((resolve, reject) => {
        let options = { cwd: rootDir };
        let objectId = `${commitSha1}:` + sourceFilePath.replace(/\\/g, '/');
        let ls = child_process_1.spawn(gitExecutable, ['show', objectId], options);
        let error = '';
        ls.stdout.on('data', function (data) {
            fs.appendFileSync(targetFile, data);
        });
        ls.stderr.on('data', function (data) {
            error += data;
        });
        ls.on('error', function (error) {
            console.error(error);
            reject(error);
            return;
        });
        ls.on('close', function () {
            if (error.length > 0) {
                reject(error);
                return;
            }
            resolve(targetFile);
        });
    }));
}
exports.writeFile = writeFile;
//# sourceMappingURL=historyUtils.js.map