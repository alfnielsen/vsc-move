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
const vscode = require("vscode");
/**
 * Transform an absolute path to a relative path. (Only if the relative path in in same folder or a sub folder.)
 * ( test passed - )
 * dependensies: { splitPath, subtractPath, trimDashes, trimLeadingDash }
 * @param path
 * @param rootPath
 * @param absolutePath
 */
const absolutePathToSubRalative = (path, rootPath, absolutePath) => {
    const [sourceDirPath] = vsc.splitPath(path);
    let sourceDirPathFromRoot = vsc.subtractPath(sourceDirPath, rootPath);
    sourceDirPathFromRoot = vsc.trimDashes(sourceDirPathFromRoot);
    // Need endings dash to avoid remove file names with same start name as folder.
    sourceDirPathFromRoot = sourceDirPathFromRoot + '/';
    let absolutePathFromSourceDir = vsc.subtractPath(absolutePath, sourceDirPathFromRoot);
    absolutePathFromSourceDir = vsc.trimLeadingDash(absolutePathFromSourceDir);
    //const isSubPath = this.isSubPath(absolutePathFromSourceDir, absolutePath)
    if (absolutePathFromSourceDir !== absolutePath) {
        absolutePathFromSourceDir = vsc.addLeadingLocalDash(absolutePathFromSourceDir);
    }
    return absolutePathFromSourceDir;
};
/**
 * Add './' to start of path
 * @param path
 */
const addLeadingLocalDash = (path) => {
    return './' + path;
};
/**
 * Test is a path is directory
 * dependensies: { vscode.window.shoInputBox }
 * @param path
 */
const ask = (question, defaultValue) => __awaiter(this, void 0, void 0, function* () {
    return yield vscode.window.showInputBox({
        prompt: question,
        value: defaultValue
    });
});
/**
 * Format a string from camel-case to kebab-case. Commonly used to define css class names. (SomeName => some-name)
 * ( test passed √ )
 * @param str
 */
const camalcaseToKebabcase = (str) => str[0].toLowerCase() + str.substr(1).replace(/([A-Z])/g, ([letter]) => `-${letter.toLowerCase()}`);
/**
 * Get clean path. folder/../folder/file => folder/file, folder/./file => file
 * ( test passed √ )
 * @param path
 */
const cleanPath = (path) => {
    path = path.replace(/\/.\//g, '/');
    const reg = /\/\w+\/\.\.\//;
    while (reg.test(path)) {
        path = path.replace(reg, '/');
    }
    return path;
};
/**
 * Does the folder/file exist
 * dependensies: { fs.existsSync(Faile access) }
 * @param path string
 */
const doesExists = (path) => {
    return fs.existsSync(path);
};
/**
 * Get a list off all filePaths in project the matches a glob pattern
 * dependensies: { vscode.workspace.findFiles(File access), methods.pathAsUnix }
 * @param include glob
 * @param exclude glob
 * @param maxResults
 */
const findFilePaths = (include, exclude = '**/node_modules/**', maxResults = 100000) => __awaiter(this, void 0, void 0, function* () {
    const uriFiles = yield vscode.workspace.findFiles(include, exclude, maxResults);
    const files = uriFiles.map(uri => vsc.pathAsUnix(uri.fsPath));
    return files;
});
/**
 * Get current open file path or undefioned if nonothing is open.
 * dependensies: { vscode.window.activeTextEditor }
 */
const getActiveOpenPath = () => {
    const activeEditor = vscode.window.activeTextEditor;
    const document = activeEditor && activeEditor.document;
    return (document && document.fileName) || undefined;
};
/**
 * Get vscode project config
 * dependensies: { vscode.window.getConfiguration }
 */
const getConfig = (projectName, property, defaultValue) => {
    return vscode.workspace.getConfiguration(projectName).get(property, defaultValue);
};
/**
 * Get file source
 * dependensies: { fs.readFile(File access) }
 * @param path
 */
const getFileContent = (path) => __awaiter(this, void 0, void 0, function* () { return yield fs.readFile(path, 'utf8'); });
/**
 * Get part of a json object.
 * ( test passed √ )
 * @param json
 * @param keyPath Ex sub.sub.name >> {sub:{sub:{name:'Foo'}}} >> Foo
 */
const getJsonParts = (json, keyPath) => {
    let current = json;
    const keySplit = keyPath.split(/\./);
    for (let i = 0; i < keySplit.length; i++) {
        const key = keySplit[i];
        if (current[key] === undefined) {
            return undefined;
        }
        current = current[key];
    }
    return current;
};
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
        const packageFileSource = yield vsc.getFileContent(packageFile.fsPath);
        const packageJsonRoot = JSON.parse(packageFileSource);
        if (!packageJsonRoot) {
            continue;
        }
        const dependencies = vsc.getJsonParts(packageJsonRoot, 'dependencies');
        const devDependencies = vsc.getJsonParts(packageJsonRoot, 'devDependencies');
        if (dependencies) {
            res.dependencies = Object.assign({}, res.dependencies, dependencies);
        }
        if (devDependencies) {
            packageJsonRoot.devDependencies = Object.assign({}, res.devDependencies, devDependencies);
        }
    }
    return res;
});
/**
 * Get project root for a path or undefined if no project was found.
 * dependensies: { vscode.Uri.parse, vscode.workspace.getWorkspaceFolder, methods.pathAsUnix }
 * @param path
 */
const getRootPath = (uri) => {
    //const uri = vscode.Uri.parse(path)
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (!workspaceFolder) {
        return undefined;
    }
    let rottPath = workspaceFolder.uri.fsPath;
    rottPath = vsc.pathAsUnix(rottPath);
    return rottPath;
};
/**
 * Does path start with charactor [a-zA-Z@] (not '/' or './' or '../')
 * @param path
 * @param startWithRegExp? If your project defines another definition of absolute path then overwrite this.
 */
const isAbsolutePath = (path, startWithRegExp = /^[a-zA-Z@]/) => {
    return startWithRegExp.test(path);
};
/**
 * Test is a path is directory
 * dependensies: { fs.statSync(Faile access) }
 * @param path
 */
const isDir = (path) => {
    return fs.statSync(path).isDirectory();
};
/**
 * Does subpath start with parentPath
 * ( test passed √ )
 * @param path
 * @param parentPath
 */
const isSubPath = (subPath, parentPath) => {
    const result = subPath.indexOf(parentPath) === 0;
    return result;
};
/**
 * Wraps fs.move
 * dependensies: { fs.move(File access) }
 * @param path
 * @param newPathstring
 */
const move = (path, newPath) => __awaiter(this, void 0, void 0, function* () {
    yield fs.move(path, newPath);
});
/**
 * Reaplve all '\\'  with '/'
 * @param path
 */
const pathAsUnix = (path) => {
    return path.replace(/\\/g, '/');
};
/**
 * Transform a relative path to an abspolute path.
 * ( test passed √ )
 * dependensies: { cleanPath, trimLeadingDash, subtractPath, getDirFromPath, trimLeadingLocalDash}
 * @param path File from where the relative path begins
 * @param pathRelatriveToPath The relative path
 * @param rootPath The root path
 * @param realPathTest Test if the real  The root path
 */
const relatrivePathToAbsolutePath = (path, pathRelatriveToPath, rootPath) => {
    if (vsc.isAbsolutePath(pathRelatriveToPath)) {
        return pathRelatriveToPath;
    }
    let [dir] = vsc.splitPath(path);
    dir += '/';
    const relativePath = dir + pathRelatriveToPath;
    let cleanRelativePath = vsc.cleanPath(relativePath);
    let absolutePathToRelative = vsc.subtractPath(cleanRelativePath, rootPath);
    absolutePathToRelative = vsc.trimLeadingDash(absolutePathToRelative);
    return absolutePathToRelative;
};
/**
 * Save All files
 * dependensies: { vscode.workspace.saveAll(File access) }
 */
const saveAll = () => __awaiter(this, void 0, void 0, function* () {
    yield vscode.workspace.saveAll(false);
});
/**
 * Save file
 * dependensies: { fs.writeFile(File access) }
 * @param path
 * @param content
 */
const saveFileContent = (path, content) => __awaiter(this, void 0, void 0, function* () {
    yield fs.writeFile(path, content);
});
/**
 * Show error message to user
 * dependensies: { vscode.window.showErrorMessage }
 * @param message
 */
const showErrorMessage = (message) => __awaiter(this, void 0, void 0, function* () {
    yield vscode.window.showErrorMessage(message);
});
/**
 * Show message to user
 * dependensies: { vscode.window.showErrorMessage }
 * @param message
 */
const showMessage = (message) => __awaiter(this, void 0, void 0, function* () {
    yield vscode.window.showInformationMessage(message);
});
/**
 * await wrap for setTimeout. Mostly used for debug asyc.
 * @param ms
 */
const sleep = (ms) => __awaiter(this, void 0, void 0, function* () {
    return new Promise(resolve => setTimeout(resolve, ms));
});
/**
 * Get the folder path from a file path
 * ( test passed √ )
 * dependensies: { methods.getDirFromPath }
 * @param path string
 */
const splitPath = (path) => {
    path = vsc.pathAsUnix(path);
    const splits = path.split('/');
    const name = splits.pop() || '';
    const dir = splits.join('/');
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
 * Format a string to camal-case. Commonly used to define js/ts variable names.
 * (Some-Name => someName, some_name => someName, some.name => someName )
 * All non word seperators will be removed and the word charector after will be transforms to upper case
 * ( test passed √ )
 * @param str
 */
const toCamelcase = (str) => str[0].toLowerCase() + str.substr(1).replace(/\W+(.)/g, (_match, chr) => chr.toUpperCase());
/**
 * Remove '/' from start and end of path
 * @param path
 */
const trimDashes = (path) => {
    return path.replace(/(^\/|\/$)/g, '');
};
/**
 * Remove '/' from start of path
 * @param path
 */
const trimLeadingDash = (path) => {
    return path.replace(/^\//, '');
};
/**
 * export methods
 */
const vsc /* IVscBase */ = {
    absolutePathToSubRalative,
    addLeadingLocalDash,
    ask,
    camalcaseToKebabcase,
    cleanPath,
    doesExists,
    findFilePaths,
    getActiveOpenPath,
    getConfig,
    getFileContent,
    getJsonParts,
    getPackageDependencies,
    getRootPath,
    isAbsolutePath,
    isDir,
    isSubPath,
    move,
    pathAsUnix,
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
    trimLeadingDash
};
exports.default = vsc;
//# sourceMappingURL=vsc-base.new.js.map