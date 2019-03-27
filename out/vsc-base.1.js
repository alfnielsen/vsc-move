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
const path_1 = require("path");
const vscode = require("vscode");
/**
 * await wrap for setTimeout. Mostly used for debug asyc.
 * @param ms
 */
const sleep = (ms) => __awaiter(this, void 0, void 0, function* () { return new Promise(resolve => setTimeout(resolve, ms)); });
/**
 * Wraps fs.move
 * @param path
 * @param newPathstring
 */
const move = (path, newPath) => __awaiter(this, void 0, void 0, function* () {
    yield fs.move(path, newPath);
});
/**
 * Save file
 * @param path
 * @param content
 */
const saveFileContent = (path, content) => __awaiter(this, void 0, void 0, function* () { return yield fs.writeFile(path, content); });
/**
 * Get file source
 * @param path
 */
const getFileContent = (path) => __awaiter(this, void 0, void 0, function* () { return yield fs.readFile(path, 'utf8'); });
/**
 * Save All files
 */
const saveAll = () => __awaiter(this, void 0, void 0, function* () {
    yield vscode.workspace.saveAll(false);
});
/**
 * Get a list off all files in project the matches a glob pattern
 * @param include
 * @param exclude
 * @param maxResults
 * @param token
 */
const getFiles = (include, exclude = '**/node_modules/**', maxResults = 100000, token) => __awaiter(this, void 0, void 0, function* () {
    return yield vscode.workspace.findFiles(include, exclude, maxResults, token);
});
const showMessage = (message) => __awaiter(this, void 0, void 0, function* () { return yield vscode.window.showInformationMessage(message); });
const showErrorMessage = (message) => __awaiter(this, void 0, void 0, function* () { return yield vscode.window.showErrorMessage(message); });
/**
 * Reaplve all '\\'  with '/'
 * @param path
 */
const pathAsUnix = (path) => {
    return path.replace(/\\/g, '/');
};
/**
 * Get project root path
 * @param uri
 */
const getRootPath = (uri) => {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (!workspaceFolder) {
        throw new Error('getRootPath was called with uri not within the root!');
    }
    const path = workspaceFolder.uri.fsPath;
    methods.pathAsUnix(path);
    return path;
};
/**
 * Get fs stats
 * @param path
 */
const getPathStats = (path) => __awaiter(this, void 0, void 0, function* () { return yield fs.stat(path); });
/**
 * Test is a path is directory
 * @param path
 */
const isDir = (path) => fs.statSync(path).isDirectory();
/**
 * Does the folder/file exist
 * @param path string
 */
const doesExists = (path) => {
    return fs.existsSync(path);
};
/**
 * Get the folder path from a file path
 * @param filePath string
 */
const getDirFromPath = (filePath) => {
    let dir = path_1.dirname(filePath);
    dir = methods.pathAsUnix(dir);
    return dir;
};
/**
 * Get the folder path from a file path
 * @param path string
 */
const splitPath = (path) => {
    const dir = methods.getDirFromPath(path);
    const splits = path.split('/');
    const name = splits[splits.length - 1];
    return [dir, name];
};
/**
 * Remove parent-path from a path
 * @param path
 * @param rootPath
 */
const subtractPath = (path, rootPath) => {
    return path.replace(rootPath, '');
};
/**
 * Remove '/' from start of path
 * @param path
 */
const trimLeadingDash = (path) => {
    return path.replace(/^\//, '');
};
/**
 * Remove '/' from start and end of path
 * @param path
 */
const trimDashes = (path) => {
    return path.replace(/(^\/|\/$)/g, '');
};
/**
 * Remove './' from start of path
 * @param path
 */
const trimLeadingLocalDash = (path) => {
    return path.replace(/^\.?\//, '');
};
/**
 * Remove './' from start of path
 * @param path
 */
const addLeadingLocalDash = (path) => {
    return './' + path;
};
/**
 * Get real path.
 * This cleans path and test for path where file extension is not written (ES6 import dont need file extension)
 * Return system safe path (no '\\')
 * @param path
 * @param addedExtensions ES6 import can omit the file extension. This will test agains a list of endings. (The resolve will still not contain the extension)
 */
const realPath = (path, addedExtensions = ['js', 'jsx', 'ts', 'tsx']) => {
    let realPath;
    try {
        realPath = fs.realpathSync(path);
        realPath = methods.pathAsUnix(realPath);
        return realPath;
    }
    catch (e) { }
    for (let i = 0; i < addedExtensions.length; i++) {
        const ext = '.' + addedExtensions[i];
        try {
            realPath = fs.realpathSync(path + ext);
            realPath = realPath.substring(0, realPath.length - ext.length);
            realPath = methods.pathAsUnix(realPath);
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
const relatrivePathToAbsolutePath = (path, pathRelatriveToPath, rootPath) => {
    pathRelatriveToPath = methods.trimLeadingLocalDash(pathRelatriveToPath);
    let dir = methods.getDirFromPath(path);
    if (dir[dir.length - 1] !== '/') {
        dir += '/';
    }
    const relativePath = dir + pathRelatriveToPath;
    let cleanRelativePath = methods.realPath(relativePath);
    if (cleanRelativePath === undefined) {
        return pathRelatriveToPath;
    }
    let absolutePathToRelative = methods.subtractPath(cleanRelativePath, rootPath);
    absolutePathToRelative = methods.trimLeadingDash(absolutePathToRelative);
    return absolutePathToRelative;
};
/**
 * Get vscode project config
 */
const getConfig = function getConfig(projectName, property, defaultValue) {
    return vscode.workspace.getConfiguration(projectName).get(property, defaultValue);
};
/**
 * Test is a path is directory
 * @param path
 */
const ask = (question, devaultValue) => __awaiter(this, void 0, void 0, function* () {
    return yield vscode.window.showInputBox({
        prompt: question,
        value: devaultValue
    });
});
let methods = {
    sleep,
    move,
    saveFileContent,
    getFileContent,
    saveAll,
    getFiles,
    showMessage,
    showErrorMessage,
    pathAsUnix,
    getRootPath,
    getPathStats,
    isDir,
    doesExists,
    getDirFromPath,
    splitPath,
    subtractPath,
    trimLeadingDash,
    trimDashes,
    trimLeadingLocalDash,
    addLeadingLocalDash,
    realPath,
    relatrivePathToAbsolutePath,
    getConfig,
    ask,
    intercept: (overwrites) => {
        for (const key in overwrites) {
            //@ts-ignore
            methods[key] = overwrites[key];
        }
    }
};
exports.intercept = (overwrites) => {
    for (const key in overwrites) {
        //@ts-ignore
        methods[key] = overwrites[key];
    }
};
exports.commonInterceptOverwrites = {
    move: () => __awaiter(this, void 0, void 0, function* () { return yield sleep(1); }),
    saveFileContent: () => __awaiter(this, void 0, void 0, function* () { return yield sleep(1); }),
    getFileContent: () => __awaiter(this, void 0, void 0, function* () {
        yield sleep(1);
        return '';
    }),
    saveAll: () => __awaiter(this, void 0, void 0, function* () { return yield sleep(1); }),
    getFiles: () => __awaiter(this, void 0, void 0, function* () {
        yield sleep(1);
        return [];
    }),
    showMessage: () => __awaiter(this, void 0, void 0, function* () { return yield sleep(1); }),
    showErrorMessage: () => __awaiter(this, void 0, void 0, function* () { return yield sleep(1); }),
    pathAsUnix,
    getRootPath: () => '',
    getPathStats: () => __awaiter(this, void 0, void 0, function* () {
        yield sleep(1);
        return {};
    }),
    isDir: () => true,
    doesExists: () => true,
    getDirFromPath,
    splitPath,
    subtractPath,
    trimLeadingDash,
    trimDashes,
    trimLeadingLocalDash,
    addLeadingLocalDash,
    realPath: (path) => path,
    relatrivePathToAbsolutePath,
    getConfig: function getConfig(_projectName, _property, defaultValue) {
        return defaultValue;
    },
    ask: (_question, devaultValue) => __awaiter(this, void 0, void 0, function* () {
        yield sleep(1);
        return devaultValue;
    }) // async vscode access
};
exports.default = methods;
//# sourceMappingURL=vsc-base.1.js.map