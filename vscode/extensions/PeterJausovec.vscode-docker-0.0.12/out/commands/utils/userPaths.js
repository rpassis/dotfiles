var path = require('path');
var os = require('os');
function getAppDataPath(platform) {
    switch (platform) {
        case 'win32': return process.env['APPDATA'] || path.join(process.env['USERPROFILE'], 'AppData', 'Roaming');
        case 'darwin': return path.join(os.homedir(), 'Library', 'Application Support');
        case 'linux': return process.env['XDG_CONFIG_HOME'] || path.join(os.homedir(), '.config');
        default: throw new Error('Platform not supported');
    }
}
function getDefaultUserDataPath(platform) {
    return path.join(getAppDataPath(platform), pkg.name);
}
exports.getAppDataPath = getAppDataPath;
exports.getDefaultUserDataPath = getDefaultUserDataPath;
//# sourceMappingURL=userPaths.js.map