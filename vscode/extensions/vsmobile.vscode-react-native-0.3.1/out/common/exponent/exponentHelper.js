// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
"use strict";
const path = require("path");
const Q = require("q");
const XDL = require("./xdlInterface");
const stripJsonComments = require("strip-json-comments");
const fileSystem_1 = require("../node/fileSystem");
const package_1 = require("../node/package");
const reactNativeProjectHelper_1 = require("../reactNativeProjectHelper");
const commandExecutor_1 = require("../commandExecutor");
const hostPlatform_1 = require("../hostPlatform");
const log_1 = require("../log/log");
const VSCODE_EXPONENT_JSON = "vscodeExponent.json";
const EXPONENT_INDEX = "exponentIndex.js";
const DEFAULT_EXPONENT_INDEX = "main.js";
const DEFAULT_IOS_INDEX = "index.ios.js";
const DEFAULT_ANDROID_INDEX = "index.android.js";
const EXP_JSON = "exp.json";
const SECONDS_IN_DAY = 86400;
var ReactNativePackageStatus;
(function (ReactNativePackageStatus) {
    ReactNativePackageStatus[ReactNativePackageStatus["FACEBOOK_PACKAGE"] = 0] = "FACEBOOK_PACKAGE";
    ReactNativePackageStatus[ReactNativePackageStatus["EXPONENT_PACKAGE"] = 1] = "EXPONENT_PACKAGE";
    ReactNativePackageStatus[ReactNativePackageStatus["UNKNOWN"] = 2] = "UNKNOWN";
})(ReactNativePackageStatus || (ReactNativePackageStatus = {}));
class ExponentHelper {
    constructor(workspaceRootPath, projectRootPath) {
        this.workspaceRootPath = workspaceRootPath;
        this.projectRootPath = projectRootPath;
        this.hasInitialized = false;
        // Constructor is slim by design. This is to add as less computation as possible
        // to the initialization of the extension. If a public method is added, make sure
        // to call this.lazilyInitialize() at the begining of the code to be sure all variables
        // are correctly initialized.
    }
    /**
     * Convert react native project to exponent.
     * This consists on three steps:
     * 1. Change the dependency from facebook's react-native to exponent's fork
     * 2. Create exp.json
     * 3. Create index and entrypoint for exponent
     */
    configureExponentEnvironment() {
        this.lazilyInitialize();
        log_1.Log.logMessage("Making sure your project uses the correct dependencies for exponent. This may take a while...");
        return this.changeReactNativeToExponent()
            .then(() => {
            log_1.Log.logMessage("Dependencies are correct. Making sure you have any necessary configuration file.");
            return this.ensureExpJson();
        }).then(() => {
            log_1.Log.logMessage("Project setup is correct. Generating entrypoint code.");
            return this.createIndex();
        });
    }
    /**
     * Change dependencies to point to original react-native repo
     */
    configureReactNativeEnvironment() {
        this.lazilyInitialize();
        log_1.Log.logMessage("Checking react native is correctly setup. This may take a while...");
        return this.changeExponentToReactNative();
    }
    /**
     * Returns the current user. If there is none, asks user for username and password and logins to exponent servers.
     */
    loginToExponent(promptForInformation, showMessage) {
        this.lazilyInitialize();
        return XDL.currentUser()
            .then((user) => {
            if (!user) {
                let username = "";
                return showMessage("You need to login to exponent. Please provide username and password to login. If you don't have an account we will create one for you.")
                    .then(() => promptForInformation("Exponent username", false)).then((name) => {
                    username = name;
                    return promptForInformation("Exponent password", true);
                })
                    .then((password) => XDL.login(username, password));
            }
            return user;
        })
            .catch(error => {
            return Q.reject(error);
        });
    }
    /**
     * File used as an entrypoint for exponent. This file's component should be registered as "main"
     * in the AppRegistry and should only render a entrypoint component.
     */
    createIndex() {
        this.lazilyInitialize();
        const pkg = require("../../../package.json");
        const extensionVersionNumber = pkg.version;
        const extensionName = pkg.name;
        return Q.all([this.entrypointComponent(), this.entrypoint()])
            .spread((componentName, entryPointFile) => {
            const fileContents = `// This file is automatically generated by ${extensionName}@${extensionVersionNumber}
// Please do not modify it manually. All changes will be lost.
var React = require('${this.projectRootPath}/node_modules/react');
var {Component} = React;

var ReactNative = require('${this.projectRootPath}/node_modules/react-native');
var {AppRegistry} = ReactNative;

var entryPoint = require('${this.projectRootPath}/${entryPointFile}');

AppRegistry.registerRunnable('main', function(appParameters) {
    AppRegistry.runApplication('${componentName}', appParameters);
});`;
            return this.fileSystem.writeFile(this.dotvscodePath(EXPONENT_INDEX), fileContents);
        });
    }
    /**
     * Create exp.json file in the workspace root if not present
     */
    ensureExpJson() {
        this.lazilyInitialize();
        let defaultSettings = {
            "sdkVersion": "",
            "entryPoint": this.dotvscodePath(EXPONENT_INDEX),
            "slug": "",
            "name": "",
        };
        return this.readVscodeExponentSettingFile()
            .then(exponentJson => {
            const expJsonPath = this.pathToFileInWorkspace(EXP_JSON);
            if (!this.fileSystem.existsSync(expJsonPath) || exponentJson.overwriteExpJson) {
                return this.getPackageName()
                    .then(name => {
                    // Name and slug are supposed to be the same,
                    // but slug only supports alpha numeric and -,
                    // while name should be human readable
                    defaultSettings.slug = name.replace(" ", "-");
                    defaultSettings.name = name;
                    return this.exponentSdk();
                })
                    .then(exponentVersion => {
                    if (!exponentVersion) {
                        return XDL.supportedVersions()
                            .then((versions) => {
                            return Q.reject(new Error(`React Native version not supported by exponent. Major versions supported: ${versions.join(", ")}`));
                        });
                    }
                    defaultSettings.sdkVersion = exponentVersion;
                    return this.fileSystem.writeFile(expJsonPath, JSON.stringify(defaultSettings, null, 4));
                });
            }
        });
    }
    /**
     * Changes npm dependency from react native to exponent's fork
     */
    changeReactNativeToExponent() {
        log_1.Log.logString("Checking if react native is from exponent.");
        return this.usingReactNativeExponent(true)
            .then(usingExponent => {
            log_1.Log.logString(".\n");
            if (usingExponent) {
                return Q.resolve(void 0);
            }
            log_1.Log.logString("Getting appropriate Exponent SDK Version to install.");
            return this.exponentSdk(true)
                .then(sdkVersion => {
                log_1.Log.logString(".\n");
                if (!sdkVersion) {
                    return XDL.supportedVersions()
                        .then((versions) => {
                        return Q.reject(new Error(`React Native version not supported by exponent. Major versions supported: ${versions.join(", ")}`));
                    });
                }
                const exponentFork = `github:exponentjs/react-native#sdk-${sdkVersion}`;
                log_1.Log.logString("Uninstalling current react native package.");
                return Q(this.commandExecutor.spawnWithProgress(hostPlatform_1.HostPlatform.getNpmCliCommand("npm"), ["uninstall", "react-native", "--verbose"], { verbosity: commandExecutor_1.CommandVerbosity.PROGRESS }))
                    .then(() => {
                    log_1.Log.logString("Installing exponent react native package.");
                    return this.commandExecutor.spawnWithProgress(hostPlatform_1.HostPlatform.getNpmCliCommand("npm"), ["install", exponentFork, "--cache-min", SECONDS_IN_DAY.toString(10), "--verbose"], { verbosity: commandExecutor_1.CommandVerbosity.PROGRESS });
                });
            });
        })
            .then(() => {
            this.dependencyPackage = ReactNativePackageStatus.EXPONENT_PACKAGE;
        });
    }
    /**
     * Changes npm dependency from exponent's fork to react native
     */
    changeExponentToReactNative() {
        log_1.Log.logString("Checking if the correct react native is installed.");
        return this.usingReactNativeExponent()
            .then(usingExponent => {
            log_1.Log.logString(".\n");
            if (!usingExponent) {
                return Q.resolve(void 0);
            }
            log_1.Log.logString("Uninstalling current react native package.");
            return Q(this.commandExecutor.spawnWithProgress(hostPlatform_1.HostPlatform.getNpmCliCommand("npm"), ["uninstall", "react-native", "--verbose"], { verbosity: commandExecutor_1.CommandVerbosity.PROGRESS }))
                .then(() => {
                log_1.Log.logString("Installing correct react native package.");
                return this.commandExecutor.spawnWithProgress(hostPlatform_1.HostPlatform.getNpmCliCommand("npm"), ["install", "react-native", "--cache-min", SECONDS_IN_DAY.toString(10), "--verbose"], { verbosity: commandExecutor_1.CommandVerbosity.PROGRESS });
            });
        })
            .then(() => {
            this.dependencyPackage = ReactNativePackageStatus.FACEBOOK_PACKAGE;
        });
    }
    /**
     * Reads VSCODE_EXPONENT Settings file. If it doesn't exists it creates one by
     * guessing which entrypoint and filename to use.
     */
    readVscodeExponentSettingFile() {
        // Only create a new one if there is not one already
        return this.fileSystem.exists(this.dotvscodePath(VSCODE_EXPONENT_JSON))
            .then((vscodeExponentExists) => {
            if (vscodeExponentExists) {
                return this.fileSystem.readFile(this.dotvscodePath(VSCODE_EXPONENT_JSON), "utf-8")
                    .then(function (jsonContents) {
                    return JSON.parse(stripJsonComments(jsonContents));
                });
            }
            else {
                let defaultSettings = {
                    "entryPointFilename": "",
                    "entryPointComponent": "",
                    "overwriteExpJson": false,
                };
                return this.getPackageName()
                    .then(packageName => {
                    // By default react-native uses the package name for the entry component. This is our safest guess.
                    defaultSettings.entryPointComponent = packageName;
                    this.entrypointComponentName = defaultSettings.entryPointComponent;
                    return Q.all([
                        this.fileSystem.exists(this.pathToFileInWorkspace(DEFAULT_IOS_INDEX)),
                        this.fileSystem.exists(this.pathToFileInWorkspace(DEFAULT_EXPONENT_INDEX)),
                    ]);
                })
                    .spread((indexIosExists, mainExists) => {
                    // If there is an ios entrypoint we want to use that, if not let's go with android
                    defaultSettings.entryPointFilename =
                        mainExists ? DEFAULT_EXPONENT_INDEX
                            : indexIosExists ? DEFAULT_IOS_INDEX
                                : DEFAULT_ANDROID_INDEX;
                    this.entrypointFilename = defaultSettings.entryPointFilename;
                    return this.fileSystem.writeFile(this.dotvscodePath(VSCODE_EXPONENT_JSON), JSON.stringify(defaultSettings, null, 4));
                })
                    .then(() => {
                    return defaultSettings;
                });
            }
        });
    }
    /**
     * Exponent sdk version that maps to the current react-native version
     * If react native version is not supported it returns null.
     */
    exponentSdk(showProgress = false) {
        if (showProgress)
            log_1.Log.logString("...");
        if (this.expSdkVersion) {
            return Q(this.expSdkVersion);
        }
        return this.readFromExpJson("sdkVersion")
            .then((sdkVersion) => {
            if (showProgress)
                log_1.Log.logString(".");
            if (sdkVersion) {
                this.expSdkVersion = sdkVersion;
                return this.expSdkVersion;
            }
            let reactNativeProjectHelper = new reactNativeProjectHelper_1.ReactNativeProjectHelper(this.projectRootPath);
            return reactNativeProjectHelper.getReactNativeVersion()
                .then(version => {
                if (showProgress)
                    log_1.Log.logString(".");
                return XDL.mapVersion(version)
                    .then(exponentVersion => {
                    this.expSdkVersion = exponentVersion;
                    return this.expSdkVersion;
                });
            });
        });
    }
    /**
     * Returns the specified setting from exp.json if it exists
     */
    readFromExpJson(setting) {
        const expJsonPath = this.pathToFileInWorkspace(EXP_JSON);
        return this.fileSystem.exists(expJsonPath)
            .then((exists) => {
            if (!exists) {
                return null;
            }
            return this.fileSystem.readFile(expJsonPath, "utf-8")
                .then(function (jsonContents) {
                return JSON.parse(stripJsonComments(jsonContents))[setting];
            });
        });
    }
    /**
     * Looks at the _from attribute in the package json of the react-native dependency
     * to figure out if it's using exponent.
     */
    usingReactNativeExponent(showProgress = false) {
        if (showProgress)
            log_1.Log.logString("...");
        if (this.dependencyPackage !== ReactNativePackageStatus.UNKNOWN) {
            return Q(this.dependencyPackage === ReactNativePackageStatus.EXPONENT_PACKAGE);
        }
        // Look for the package.json of the dependecy
        const pathToReactNativePackageJson = path.resolve(this.projectRootPath, "node_modules", "react-native", "package.json");
        return this.fileSystem.readFile(pathToReactNativePackageJson, "utf-8")
            .then(jsonContents => {
            const packageJson = JSON.parse(jsonContents);
            const isExp = /\bexponentjs\/react-native\b/.test(packageJson._from);
            this.dependencyPackage = isExp ? ReactNativePackageStatus.EXPONENT_PACKAGE : ReactNativePackageStatus.FACEBOOK_PACKAGE;
            if (showProgress)
                log_1.Log.logString(".");
            return isExp;
        }).catch(() => {
            if (showProgress)
                log_1.Log.logString(".");
            // Not in a react-native project
            return false;
        });
    }
    /**
     * Name of the file (we assume it lives in the workspace root) that should be used as entrypoint.
     * e.g. index.ios.js
     */
    entrypoint() {
        if (this.entrypointFilename) {
            return Q(this.entrypointFilename);
        }
        return this.readVscodeExponentSettingFile()
            .then((settingsJson) => {
            // Let's load both to memory to make sure we are not reading from memory next time we query for this.
            this.entrypointFilename = settingsJson.entryPointFilename;
            this.entrypointComponentName = settingsJson.entryPointComponent;
            return this.entrypointFilename;
        });
    }
    /**
     * Name of the component used as an entrypoint for the app.
     */
    entrypointComponent() {
        if (this.entrypointComponentName) {
            return Q(this.entrypointComponentName);
        }
        return this.readVscodeExponentSettingFile()
            .then((settingsJson) => {
            // Let's load both to memory to make sure we are not reading from memory next time we query for this.
            this.entrypointComponentName = settingsJson.entryPointComponent;
            this.entrypointFilename = settingsJson.entrypointFilename;
            return this.entrypointComponentName;
        });
    }
    /**
     * Path to a given file inside the .vscode directory
     */
    dotvscodePath(filename) {
        return path.join(this.workspaceRootPath, ".vscode", filename);
    }
    /**
     * Path to a given file from the workspace root
     */
    pathToFileInWorkspace(filename) {
        return path.join(this.projectRootPath, filename);
    }
    /**
     * Name specified on user's package.json
     */
    getPackageName() {
        return new package_1.Package(this.projectRootPath, { fileSystem: this.fileSystem }).name();
    }
    /**
     * Works as a constructor but only initiliazes when it's actually needed.
     */
    lazilyInitialize() {
        if (!this.hasInitialized) {
            this.hasInitialized = true;
            this.fileSystem = new fileSystem_1.FileSystem();
            this.commandExecutor = new commandExecutor_1.CommandExecutor(this.projectRootPath);
            this.dependencyPackage = ReactNativePackageStatus.UNKNOWN;
            XDL.configReactNativeVersionWargnings();
            XDL.attachLoggerStream(this.projectRootPath, {
                stream: {
                    write: (chunk) => {
                        if (chunk.level <= 30) {
                            log_1.Log.logString(chunk.msg);
                        }
                        else if (chunk.level === 40) {
                            log_1.Log.logWarning(chunk.msg);
                        }
                        else {
                            log_1.Log.logError(chunk.msg);
                        }
                    },
                },
                type: "raw",
            });
        }
    }
}
exports.ExponentHelper = ExponentHelper;

//# sourceMappingURL=exponentHelper.js.map
