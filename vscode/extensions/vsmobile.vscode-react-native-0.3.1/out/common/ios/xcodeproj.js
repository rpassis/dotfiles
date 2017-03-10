// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
"use strict";
const path = require("path");
const fileSystem_1 = require("../../common/node/fileSystem");
class Xcodeproj {
    constructor({ nodeFileSystem = new fileSystem_1.FileSystem(), } = {}) {
        this.nodeFileSystem = nodeFileSystem;
    }
    findXcodeprojFile(projectRoot) {
        return this.nodeFileSystem
            .readDir(projectRoot)
            .then((files) => {
            const sorted = files.sort();
            const candidate = sorted.find((file) => [".xcodeproj", ".xcworkspace"].indexOf(path.extname(file)) !== -1);
            if (!candidate) {
                throw new Error("Unable to find any xcodeproj or xcworkspace files.");
            }
            const fileName = path.join(projectRoot, candidate);
            const fileType = path.extname(candidate);
            const projectName = path.basename(candidate, fileType);
            return {
                fileName: fileName,
                fileType: fileType,
                projectName: projectName,
            };
        });
    }
}
exports.Xcodeproj = Xcodeproj;

//# sourceMappingURL=xcodeproj.js.map
