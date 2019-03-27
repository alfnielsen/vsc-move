"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const vscode = require("vscode");
/**
 * Save file
 * @param path
 * @param content
 */
exports.saveFileContent = (path, content) => __awaiter(this, void 0, void 0, function* () { return yield fs.writeFile(path, content); });
/**
 * Get file source
 * @param path
 */
exports.getFileContent = (path) => __awaiter(this, void 0, void 0, function* () { return yield fs.readFile(path, 'utf8'); });
/**
 * Save All files
 */
exports.saveAll = () => __awaiter(this, void 0, void 0, function* () {
    yield vscode.workspace.saveAll(false);
});
/**
 * Get a list off all files in project the matches a glob pattern
 * @param include
 * @param exclude
 * @param maxResults
 * @param token
 */
exports.getFiles = (include, exclude = '**/node_modules/**', maxResults = 100000, token) => __awaiter(this, void 0, void 0, function* () {
    return yield vscode.workspace.findFiles(include, exclude, maxResults, token);
});
exports.showMessage = (message) => vscode.window.showInformationMessage(message);
exports.showErrorMessage = (message) => vscode.window.showErrorMessage(message);
/**
 * Reaplve all '\\'  with '/'
 * @param path
 */
exports.pathAsUnix = (path) => {
    return path.replace(/\\/g, '/');
};
/**
 * Get project root path
 * @param uri
 */
exports.getRootPath = (uri) => {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (!workspaceFolder) {
        throw new Error('getRootPath was called with uri not within the root!');
    }
    const path = workspaceFolder.uri.fsPath;
    exports.pathAsUnix(path);
    return path;
};
/**
 * Get fs stats
 * @param path
 */
exports.getPathStats = (path) => __awaiter(this, void 0, void 0, function* () { return yield fs.stat(path); });
/**
 * Test is a path is directory
 * @param path
 */
exports.isDir = (path) => fs.statSync(path).isDirectory();
/**
 * Does the folder/file exist
 * @param path string
 */
exports.doesExists = (path) => {
    return fs.existsSync(path);
};
/**
 * Get the folder path from a file path
 * @param filePath string
 */
exports.getDirFromPath = (filePath) => {
    let dir = path.dirname(filePath);
    dir = exports.pathAsUnix(dir);
    return dir;
};
/**
 * Get the folder path from a file path
 * @param path string
 */
exports.splitPath = (path) => {
    const dir = exports.getDirFromPath(path);
    const splits = path.split('/');
    const name = splits[splits.length - 1];
    return [dir, name];
};
/**
 * Remove parent-path from a path
 * @param path
 * @param rootPath
 */
exports.subtractPath = (path, rootPath) => {
    return path.replace(rootPath, '');
};
/**
 * Remove '/' from start of path
 * @param path
 */
exports.trimLeadingDash = (path) => {
    return path.replace(/^\//, '');
};
/**
 * Remove './' from start of path
 * @param path
 */
exports.trimLeadingLocalDash = (path) => {
    return path.replace(/^\.\//, '');
};
/**
 * Remove './' from start of path
 * @param path
 */
exports.addLeadingLocalDash = (path) => {
    return './' + path;
};
/**
 * Get real path.
 * This cleans path and test for path where file extension is not written (ES6 import dont need file extension)
 * Return system safe path (no '\\')
 * @param path
 * @param addedExtensions ES6 import can omit the file extension. This will test agains a list of endings. (The resolve will still not contain the extension)
 */
exports.realPath = (path, addedExtensions = ['js', 'jsx', 'ts', 'tsx']) => {
    let realPath;
    try {
        realPath = fs.realpathSync(path);
        realPath = exports.pathAsUnix(realPath);
        return realPath;
    }
    catch (e) { }
    for (let i = 0; i < addedExtensions.length; i++) {
        const ext = addedExtensions[i];
        try {
            realPath = fs.realpathSync(path + ext);
            realPath = realPath.substring(0, realPath.length - ext.length);
            realPath = exports.pathAsUnix(realPath);
            return realPath;
        }
        catch (e) { }
    }
    return undefined;
};
/**
 * Get path from root
 * @param path File from where the relative path begins
 * @param pathRelatriveToPath The relative path
 * @param rootPath The root path
 */
exports.relatrivePathToAbsolutePath = (path, pathRelatriveToPath, rootPath) => {
    pathRelatriveToPath = exports.trimLeadingDash(pathRelatriveToPath);
    let dir = exports.getDirFromPath(path);
    if (dir[dir.length - 1] !== '/') {
        dir += '/';
    }
    const relativePath = dir + pathRelatriveToPath;
    let cleanRelativePath = exports.realPath(relativePath);
    if (cleanRelativePath === undefined) {
        return pathRelatriveToPath;
    }
    let absolutePathToRelative = exports.subtractPath(cleanRelativePath, rootPath);
    absolutePathToRelative = exports.trimLeadingDash(absolutePathToRelative);
    return absolutePathToRelative;
};
/**
 * Get vscode project config
 */
exports.getConfig = function getConfig(projectName, property, defaultValue) {
    return vscode.workspace.getConfiguration(projectName).get(property, defaultValue);
};
/**
 * Test is a path is directory
 * @param path
 */
exports.ask = (question, devaultValue) => __awaiter(this, void 0, void 0, function* () {
    return yield vscode.window.showInputBox({
        prompt: question,
        value: devaultValue
    });
});
//# sourceMappingURL=index.js.map