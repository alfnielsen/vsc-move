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
const sleep = (ms) => __awaiter(this, void 0, void 0, function* () {
    return new Promise(resolve => setTimeout(resolve, ms));
});
/**
 * Wraps fs.move
 * dependensies: { fs.move(File access) }
 * @param path
 * @param newPathstring
 */
const move = (path, newPath) => __awaiter(this, void 0, void 0, function* () {
    yield fs.move(path, newPath);
});
const move_interception = () => __awaiter(this, void 0, void 0, function* () { return yield sleep(1); });
/**
 * Save file
 * dependensies: { fs.writeFile(File access) }
 * @param path
 * @param content
 */
const saveFileContent = (path, content) => __awaiter(this, void 0, void 0, function* () {
    yield fs.writeFile(path, content);
});
const saveFileContent_interception = () => __awaiter(this, void 0, void 0, function* () { return yield sleep(1); });
/**
 * Get file source
 * dependensies: { fs.readFile(File access) }
 * @param path
 */
const getFileContent = (path) => __awaiter(this, void 0, void 0, function* () { return yield fs.readFile(path, 'utf8'); });
const getFileContent_interception = () => __awaiter(this, void 0, void 0, function* () {
    yield sleep(1);
    return '';
});
const getFileContent_interception_factory = (fileContent) => () => __awaiter(this, void 0, void 0, function* () {
    yield sleep(1);
    return fileContent;
});
/**
 * Save All files
 * dependensies: { vscode.workspace.saveAll(File access) }
 */
const saveAll = () => __awaiter(this, void 0, void 0, function* () {
    yield vscode.workspace.saveAll(false);
});
const saveAll_interception = () => __awaiter(this, void 0, void 0, function* () { return yield sleep(1); });
/**
 * Get a list off all filePaths in project the matches a glob pattern
 * dependensies: { vscode.workspace.findFiles(File access), methods.pathAsUnix }
 * @param include glob
 * @param exclude glob
 * @param maxResults
 */
const findFilePaths = (include, exclude = '**/node_modules/**', maxResults = 100000) => __awaiter(this, void 0, void 0, function* () {
    const uriFiles = yield vscode.workspace.findFiles(include, exclude, maxResults);
    const files = uriFiles.map(uri => methods.pathAsUnix(uri.fsPath));
    return files;
});
const findFilePaths_interception = () => __awaiter(this, void 0, void 0, function* () {
    yield sleep(1);
    return [];
});
const findFilePaths_interception_factory = (filePaths) => () => __awaiter(this, void 0, void 0, function* () {
    yield sleep(1);
    return filePaths;
});
/**
 * Show message to user
 * dependensies: { vscode.window.showErrorMessage }
 * @param message
 */
const showMessage = (message) => __awaiter(this, void 0, void 0, function* () {
    yield vscode.window.showInformationMessage(message);
});
const showMessage_interception = () => __awaiter(this, void 0, void 0, function* () { return yield sleep(1); });
/**
 * Show error message to user
 * dependensies: { vscode.window.showErrorMessage }
 * @param message
 */
const showErrorMessage = (message) => __awaiter(this, void 0, void 0, function* () {
    yield vscode.window.showErrorMessage(message);
});
const showErrorMessage_interception = () => __awaiter(this, void 0, void 0, function* () { return yield sleep(1); });
/**
 * Reaplve all '\\'  with '/'
 * @param path
 */
const pathAsUnix = (path) => {
    return path.replace(/\\/g, '/');
};
/**
 * Get current open file path or undefioned if nonothing is open.
 * dependensies: { vscode.window.activeTextEditor }
 */
const getActiveOpenPath = () => {
    const activeEditor = vscode.window.activeTextEditor;
    const document = activeEditor && activeEditor.document;
    return (document && document.fileName) || undefined;
};
const getActiveOpenPath_interception = () => undefined;
const getActiveOpenPath_interception_factory = (openPath) => () => openPath;
/**
 * Get project root for a path or undefined if no project was found.
 * dependensies: { vscode.Uri.parse, vscode.workspace.getWorkspaceFolder, methods.pathAsUnix }
 * @param path
 */
const getRootPath = (path) => {
    const uri = vscode.Uri.parse(path);
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (!workspaceFolder) {
        return undefined;
    }
    let rottPath = workspaceFolder.uri.fsPath;
    rottPath = methods.pathAsUnix(rottPath);
    return rottPath;
};
const getRootPath_interception = () => '';
const getRootPath_interception_factory = (getRootPath) => () => getRootPath;
/**
 * Test is a path is directory
 * dependensies: { fs.statSync(Faile access) }
 * @param path
 */
const isDir = (path) => {
    return fs.statSync(path).isDirectory();
};
const isDir_interception = () => false;
const isDir_interception_factory = (isDir) => () => isDir;
/**
 * Does the folder/file exist
 * dependensies: { fs.existsSync(Faile access) }
 * @param path string
 */
const doesExists = (path) => {
    return fs.existsSync(path);
};
const doesExists_interception = () => false;
const doesExists_interception_factory = (doesExists) => () => doesExists;
/**
 * Get the folder path from a file path
 * dependensies: { path.dirname, methods.pathAsUnix }
 * @param filePath string
 */
const getDirFromPath = (filePath) => {
    let dir = path_1.dirname(filePath);
    dir = methods.pathAsUnix(dir);
    return dir;
};
/**
 * Get the folder path from a file path
 * dependensies: { methods.getDirFromPath }
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
 * @param parentPath
 */
const subtractPath = (path, parentPath) => {
    return path.replace(parentPath, '');
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
 * Remove './' from start of path (Will remove / from the start if even if there are no . )
 * @param path
 */
const trimLeadingLocalDash = (path) => {
    return path.replace(/^\.?\//, '');
};
/**
 * Add './' to start of path
 * @param path
 */
const addLeadingLocalDash = (path) => {
    return './' + path;
};
/**
 * Get real path.
 * This cleans path and test for path where file extension is not written (ES6 import dont need file extension)
 * If the file dont exsist it will return undefine
 * dependensies: { fs.realpathSync(File access), methods.pathAsUnix }
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
const realPath_interception = (path) => path;
const realPath_interception_factory = (path) => () => path;
/**
 * Format a string to camal-case. Commonly used to define js/ts variable names.
 * (Some-Name => someName, some_name => someName, some.name => someName )
 * All non word seperators will be removed and the word charector after will be transforms to upper case
 * @param str
 */
const toCamelcase = (str) => str[0].toLowerCase() + str.substr(1).replace(/\W+(.)/g, (_match, chr) => chr.toUpperCase());
/**
 * Format a string from camel-case to kebab-case. Commonly used to define css class names. (SomeName => some-name)
 * @param str
 */
const camalcaseToKebabcase = (str) => str[0].toLowerCase() + str.substr(1).replace(/([A-Z])/g, ([letter]) => `-${letter.toLowerCase()}`);
/**
 * Find roots packages and collect the dependencies and devDependencies.
 * Return as: {dependencies:{names:version}[], devDependencies:{names:version}[]}
 * dependensies: { vscode.window.findFiles, methods.getFileContent(File access) }
 */
const getPackageDependencies = () => __awaiter(this, void 0, void 0, function* () {
    const packageFiles = yield vscode.workspace.findFiles('**/package.json', '**/node_modules/**', 1000);
    const res = { dependencies: [], devDependencies: [] };
    for (let i = 0; i < packageFiles.length; i++) {
        const packageFile = packageFiles[i];
        const packageFileSource = yield methods.getFileContent(packageFile.fsPath);
        const packageJsonRoot = JSON.parse(packageFileSource);
        if (!packageJsonRoot) {
            continue;
        }
        if (packageJsonRoot.dependencies) {
            res.dependencies = Object.assign({}, res.dependencies, packageJsonRoot.dependencies);
        }
        if (packageJsonRoot.devDependencies) {
            packageJsonRoot.devDependencies = Object.assign({}, res.devDependencies, packageJsonRoot.devDependencies);
        }
    }
    return res;
});
const getPackageDependencies_interception = () => __awaiter(this, void 0, void 0, function* () { return ({ dependencies: [], devDependencies: [] }); });
const getPackageDependencies_interception_factory = (dependencies = [], devDependencies = []) => () => __awaiter(this, void 0, void 0, function* () {
    return ({
        dependencies,
        devDependencies
    });
});
/**
 * Transform a relative path to an abspolute path.
 * dependensies: { realPath(File access), trimLeadingDash, subtractPath, getDirFromPath, trimLeadingLocalDash}
 * @param path File from where the relative path begins
 * @param pathRelatriveToPath The relative path
 * @param rootPath The root path
 * @param realPathTest Test if the real  The root path
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
 * dependensies: { vscode.window.getConfiguration }
 */
const getConfig = (projectName, property, defaultValue) => {
    return vscode.workspace.getConfiguration(projectName).get(property, defaultValue);
};
const getConfig_interception = (_projectName, _property, defaultValue) => defaultValue;
const getConfig_interception_factory = (returnValue) => () => returnValue;
/**
 * Test is a path is directory
 * dependensies: { vscode.window.shoInputBox }
 * @param path
 */
const ask = (question, devaultValue) => __awaiter(this, void 0, void 0, function* () {
    return yield vscode.window.showInputBox({
        prompt: question,
        value: devaultValue
    });
});
const ask_interception = (_question, devaultValue) => __awaiter(this, void 0, void 0, function* () {
    yield sleep(1);
    return devaultValue;
});
const ask_interception_factory = (returnValue) => () => __awaiter(this, void 0, void 0, function* () {
    yield sleep(1);
    return returnValue;
});
/**
 * Declare 'methods':
 */
const methods = {
    addLeadingLocalDash,
    ask,
    camalcaseToKebabcase,
    doesExists,
    findFilePaths,
    getActiveOpenPath,
    getConfig,
    getDirFromPath,
    getFileContent,
    getPackageDependencies,
    getRootPath,
    isDir,
    move,
    pathAsUnix,
    realPath,
    relatrivePathToAbsolutePath,
    saveAll,
    saveFileContent,
    showErrorMessage,
    showMessage,
    sleep,
    splitPath,
    subtractPath,
    toCamelcase,
    trimDashes,
    trimLeadingDash,
    trimLeadingLocalDash
};
exports.default = methods;
/**
 * Export intercept for test mocking
 */
exports.intercept = (overwrites) => {
    for (const key in overwrites) {
        //@ts-ignore
        methods[key] = overwrites[key];
    }
};
exports.commonInterceptOverwrites = {
    sleep,
    pathAsUnix,
    getDirFromPath,
    splitPath,
    subtractPath,
    trimLeadingDash,
    trimDashes,
    trimLeadingLocalDash,
    addLeadingLocalDash,
    relatrivePathToAbsolutePath,
    move: () => __awaiter(this, void 0, void 0, function* () { return yield sleep(1); }),
    saveFileContent: () => __awaiter(this, void 0, void 0, function* () { return yield sleep(1); }),
    getFileContent: () => __awaiter(this, void 0, void 0, function* () {
        yield sleep(1);
        return '';
    }),
    saveAll: () => __awaiter(this, void 0, void 0, function* () { return yield sleep(1); }),
    getFilePaths: () => __awaiter(this, void 0, void 0, function* () {
        yield sleep(1);
        return [];
    }),
    showMessage: () => __awaiter(this, void 0, void 0, function* () { return yield sleep(1); }),
    showErrorMessage: () => __awaiter(this, void 0, void 0, function* () { return yield sleep(1); }),
    getRootPath: () => '',
    isDir: () => true,
    doesExists: () => true,
    realPath: (path) => path,
    getConfig: (_projectName, _property, defaultValue) => defaultValue,
    ask: (_question, devaultValue) => __awaiter(this, void 0, void 0, function* () {
        yield sleep(1);
        return devaultValue;
    }) // async vscode access
};
//# sourceMappingURL=vsc-base.old.js.map