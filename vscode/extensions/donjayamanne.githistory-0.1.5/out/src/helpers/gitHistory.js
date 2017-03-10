"use strict";
const parser = require('../logParser');
const child_process_1 = require('child_process');
const os = require('os');
const historyUtils_1 = require('./historyUtils');
const LOG_ENTRY_SEPARATOR = '95E9659B-27DC-43C4-A717-D75969757EA5';
const STATS_SEPARATOR = parser.STATS_SEPARATOR;
const LOG_FORMAT = `--format="%n${LOG_ENTRY_SEPARATOR}%nrefs=%d%ncommit=%H%ncommitAbbrev=%h%ntree=%T%ntreeAbbrev=%t%nparents=%P%nparentsAbbrev=%p%nauthor=%an <%ae> %at%ncommitter=%cn <%ce> %ct%nsubject=%s%nbody=%b%n%nnotes=%N%n${STATS_SEPARATOR}%n"`;
function getHistory(rootDir, pageIndex = 0, pageSize = 100, branchName = 'master') {
    let args = ['log', LOG_FORMAT, '--date-order', '--decorate=full', `--skip=${pageIndex * pageSize}`, `--max-count=${pageSize}`, branchName, '--numstat', '--'];
    args = ['log', LOG_FORMAT, '--date-order', '--decorate=full', `--skip=${pageIndex * pageSize}`, `--max-count=${pageSize}`, '--numstat', '--'];
    // This is how you can view the log across all branches
    // args = ['log', LOG_FORMAT, '--date-order', '--decorate=full', `--skip=${pageIndex * pageSize}`, `--max-count=${pageSize}`, '--all', '--']
    return historyUtils_1.getGitPath().then(gitExecutable => {
        return new Promise((resolve, reject) => {
            let options = { cwd: rootDir };
            let ls = child_process_1.spawn(gitExecutable, args, options);
            let error = '';
            let outputLines = [''];
            const entries = [];
            ls.stdout.setEncoding('utf8');
            ls.stdout.on('data', (data) => {
                // console.log(data);
                data.split(/\r?\n/g).forEach((line, index, lines) => {
                    if (line === LOG_ENTRY_SEPARATOR) {
                        let entry = parser.parseLogEntry(outputLines);
                        if (entry !== null) {
                            entries.push(entry);
                        }
                        outputLines = [''];
                    }
                    if (index === 0) {
                        if (data.startsWith(os.EOL)) {
                            outputLines.push(line);
                            return;
                        }
                        outputLines[outputLines.length - 1] += line;
                        if (lines.length > 1) {
                            outputLines.push('');
                        }
                        return;
                    }
                    if (index === lines.length - 1) {
                        outputLines[outputLines.length - 1] += line;
                        return;
                    }
                    outputLines[outputLines.length - 1] += line;
                    outputLines.push('');
                });
            });
            ls.stdout.on('end', () => {
                // Process last entry as no trailing seperator
                if (outputLines.length !== 0) {
                    let entry = parser.parseLogEntry(outputLines);
                    if (entry !== null) {
                        entries.push(entry);
                    }
                }
            });
            ls.stderr.setEncoding('utf8');
            ls.stderr.on('data', function (data) {
                error += data;
            });
            ls.on('error', function (error) {
                console.error(error);
                reject(error);
                return;
            });
            ls.on('close', () => {
                if (error.length > 0) {
                    reject(error);
                    return;
                }
                resolve(entries);
            });
        });
    });
}
exports.getHistory = getHistory;
//# sourceMappingURL=gitHistory.js.map