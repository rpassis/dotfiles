/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
"use strict";
const vscode_chrome_debug_core_1 = require('vscode-chrome-debug-core');
const path = require('path');
const chromeDebugAdapter_1 = require('./chromeDebugAdapter');
const EXTENSION_NAME = 'debugger-for-chrome';
const targetFilter = target => target && (!target.type || target.type === 'page');
// Start a ChromeDebugSession configured to only match 'page' targets, which are Chrome tabs.
// Cast because DebugSession is declared twice - in this repo's vscode-debugadapter, and that of -core... TODO
vscode_chrome_debug_core_1.ChromeDebugSession.run(vscode_chrome_debug_core_1.ChromeDebugSession.getSession({
    adapter: chromeDebugAdapter_1.ChromeDebugAdapter,
    extensionName: EXTENSION_NAME,
    logFilePath: path.resolve(__dirname, '../../vscode-chrome-debug.txt'),
    targetFilter,
    pathTransformer: vscode_chrome_debug_core_1.UrlPathTransformer,
    sourceMapTransformer: vscode_chrome_debug_core_1.BaseSourceMapTransformer,
}));
/* tslint:disable:no-var-requires */
vscode_chrome_debug_core_1.logger.log(EXTENSION_NAME + ': ' + require('../../package.json').version);
/* tslint:enable:no-var-requires */
//# sourceMappingURL=chromeDebug.js.map