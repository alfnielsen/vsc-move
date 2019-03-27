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
/** * Add './' to start of path
 * @param path
 */
const addLeadingLocalDash = (path) => {
    return './' + path;
};
/** * Test is a path is directory
 * dependensies: { vscode.window.shoInputBox }
 * @param path
 */
const ask = (question, defaultValue) => __awaiter(this, void 0, void 0, function* () {
    return yield vscode.window.showInputBox({
        prompt: question,
        value: defaultValue
    });
});
const ask_interception = (_question, defaultValue) => __awaiter(this, void 0, void 0, function* () {
    yield sleep(1);
    return defaultValue;
});
const ask_interception_factory = (returnValue) => exports.interceptMethods({
    ask: () => __awaiter(this, void 0, void 0, function* () {
        yield sleep(1);
        return returnValue;
    })
});
/** * Format a string from camel-case to kebab-case. Commonly used to define css class names. (SomeName => some-name)
 * @param str
 */
const camalcaseToKebabcase = (str) => str[0].toLowerCase() + str.substr(1).replace(/([A-Z])/g, ([letter]) => `-${letter.toLowerCase()}`);
/** * Does the folder/file exist
 * dependensies: { fs.existsSync(Faile access) }
 * @param path string
 */
const doesExists = (path) => {
    return fs.existsSync(path);
};
const doesExists_interception = () => false;
const doesExists_interception_factory = (doesExists) => () => doesExists;
/** * Get a list off all filePaths in project the matches a glob pattern
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
/** * Get current open file path or undefioned if nonothing is open.
 * dependensies: { vscode.window.activeTextEditor }
 */
const getActiveOpenPath = () => {
    const activeEditor = vscode.window.activeTextEditor;
    const document = activeEditor && activeEditor.document;
    return (document && document.fileName) || undefined;
};
const getActiveOpenPath_interception = () => undefined;
const getActiveOpenPath_interception_factory = (openPath) => () => openPath;
/** * Get vscode project config
 * dependensies: { vscode.window.getConfiguration }
 */
const getConfig = (projectName, property, defaultValue) => {
    return vscode.workspace.getConfiguration(projectName).get(property, defaultValue);
};
const getConfig_interception = (_projectName, _property, defaultValue) => defaultValue;
const getConfig_interception_factory = (returnValue) => () => returnValue;
/** * Get the folder path from a file path
 * dependensies: { path.dirname, methods.pathAsUnix }
 * @param filePath string
 */
const getDirFromPath = (filePath) => {
    let dir = path_1.dirname(filePath);
    dir = methods.pathAsUnix(dir);
    return dir;
};
/** * Get file source
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
/** * Find roots packages and collect the dependencies and devDependencies.
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
/** * Get project root for a path or undefined if no project was found.
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
    rottPath = methods.pathAsUnix(rottPath);
    return rottPath;
};
const getRootPath_interception = () => '';
const getRootPath_interception_factory = (getRootPath) => () => getRootPath;
/** * Does path start with charactor \w (not '/' or './' or '../')
 * @param path
 */
const isAbsolutePath = (path) => {
    return /^\w/.test(path);
};
/** * Test is a path is directory
 * dependensies: { fs.statSync(Faile access) }
 * @param path
 */
const isDir = (path) => {
    return fs.statSync(path).isDirectory();
};
const isDir_interception = () => false;
const isDir_interception_factory = (isDir) => () => isDir;
/** * Does subpath start with parentPath
 * @param path
 * @param parentPath
 */
const isSubPath = (subPath, parentPath) => {
    // #1  subPath: 'modules/m1', parentPath: ''
    // #2  subPath: 'modules/m1', parentPath: 'modules/'
    // !#3 subPath: 'modules/m1', parentPath: 'root/'
    // #4  subPath: 'c:/root/modules/', parentPath: 'c:/root'
    const result = subPath.indexOf(parentPath) === 0;
    // #1  result: true
    // #2  result: true
    // !#3 result: false
    // #4 result: true
    return result;
};
/** * Wraps fs.move
 * dependensies: { fs.move(File access) }
 * @param path
 * @param newPathstring
 */
const move = (path, newPath) => __awaiter(this, void 0, void 0, function* () {
    yield fs.move(path, newPath);
});
const move_interception = () => __awaiter(this, void 0, void 0, function* () { return yield sleep(1); });
/** * Reaplve all '\\'  with '/'
 * @param path
 */
const pathAsUnix = (path) => {
    return path.replace(/\\/g, '/');
};
/** * Get real path.
 * This cleans path and test for path where file extension is not written (ES6 import dont need file extension)
 * It will: folder/../folder/file.js => folder/../folder/file.js, folder/./file.js = folder/file.js
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
/** * Get clean path. folder/../folder/file => folder/file, folder/./file => file
 * @param path
 */
const cleanPath = (path) => {
    return path.replace('/.', '').replace(/\/\w+\/\.\.\//, '');
};
/** * Transform a relative path to an abspolute path.
 * return undefine if the relative file does not exists!
 * dependensies: { realPath(File access), trimLeadingDash, subtractPath, getDirFromPath, trimLeadingLocalDash}
 * @param path File from where the relative path begins
 * @param pathRelatriveToPath The relative path
 * @param rootPath The root path
 * @param realPathTest Test if the real  The root path
 */
// #indetest start
const relatrivePathToAbsolutePath = (path, pathRelatriveToPath, rootPath) => {
    // #note: #4 allready an absolute path
    // #note: #5 should be stop by the programmer before ever getting to relatrivePathToAbsolutePath
    // #1: path: 'c:/root/modules/file1.js',   pathRelatriveToPath: '../file2',           rootPath: 'c:/root/'
    // #2: path: 'c:/root/modules/file1.ts',   pathRelatriveToPath: './file2',            rootPath: 'c:/root/'
    // #3: path: 'c:/root/modules/file1.tsx',  pathRelatriveToPath: './sub/file2',        rootPath: 'c:/root/'
    // #4: path: 'c:/root/modules/file1.jsx',  pathRelatriveToPath: 'modules/file3',      rootPath: 'c:/root/'
    // #5: path: 'c:/root/modules/file1.jsx',  pathRelatriveToPath: 'react',              rootPath: 'c:/root/'
    // #6: path: 'c:/root/modules/file1.js',   pathRelatriveToPath: '../modules/file2',   rootPath: 'c:/root/'
    // #7: path: 'c:/root/modules/file1.js',   pathRelatriveToPath: '../modules2/file4',  rootPath: 'c:/root/'
    // #8: path: 'c:/root/modules/file1.js',   pathRelatriveToPath: '../file2',           rootPath: 'c:/root'
    if (methods.isAbsolutePath(pathRelatriveToPath)) {
        // #1,2,3,6,7,8: never
        // #4,5: always
        return pathRelatriveToPath;
    }
    // #4, 5: never
    let dir = methods.getDirFromPath(path);
    // #1,2,3,6,7,8: dir: 'c:/root/modules'
    dir += '/';
    // #1,2,3,6,7,8: dir: 'c:/root/modules/'
    const relativePath = dir + pathRelatriveToPath;
    // #1: relativePath: 'c:/root/modules/../file2'
    // #2: relativePath: 'c:/root/modules/./file2'
    // #3: relativePath: 'c:/root/modules/./sub/file2'
    // #6: relativePath: 'c:/root/modules/../modules/file2'
    // #7: relativePath: 'c:/root/modules/../modules2/file4'
    // #8: relativePath: 'c:/root/modules/../file2'
    // #1,2,3,6,7,8: mock methods.realPath
    let cleanRelativePath = methods.realPath(relativePath);
    // #1: relativePath: 'c:/root/file2'
    // #2: relativePath: 'c:/root/modules/file2'
    // #3: relativePath: 'c:/root/modules/sub/file2'
    // #6: relativePath: 'c:/root/modules/file2'
    // #7: relativePath: 'c:/root/modules2/file4'
    // #8: relativePath: 'c:/root/file2'
    if (cleanRelativePath === undefined) {
        // #1,2,3: never
        // #note realPath uses fs and return undefined if the path do not exists.
        return undefined;
    }
    let absolutePathToRelative = methods.subtractPath(cleanRelativePath, rootPath);
    // #1: relativePath: 'file2'
    // #2: relativePath: 'modules/file2'
    // #3: relativePath: 'modules/sub/file2'
    // #6: relativePath: 'modules/file2'
    // #7: relativePath: 'modules2/file4'
    // #8: relativePath: '/file2'
    absolutePathToRelative = methods.trimLeadingDash(absolutePathToRelative);
    // #1: relativePath: 'file2'
    // #2: relativePath: 'modules/file2'
    // #3: relativePath: 'modules/sub/file2'
    // #6: relativePath: 'modules/file2'
    // #7: relativePath: 'modules2/file4'
    // #8: relativePath: 'file2'
    return absolutePathToRelative;
};
// #indetest start
/** * Save All files
 * dependensies: { vscode.workspace.saveAll(File access) }
 */
const saveAll = () => __awaiter(this, void 0, void 0, function* () {
    yield vscode.workspace.saveAll(false);
});
const saveAll_interception = () => __awaiter(this, void 0, void 0, function* () { return yield sleep(1); });
/** * Save file
 * dependensies: { fs.writeFile(File access) }
 * @param path
 * @param content
 */
const saveFileContent = (path, content) => __awaiter(this, void 0, void 0, function* () {
    yield fs.writeFile(path, content);
});
const saveFileContent_interception = () => __awaiter(this, void 0, void 0, function* () { return yield sleep(1); });
/** * Show error message to user
 * dependensies: { vscode.window.showErrorMessage }
 * @param message
 */
const showErrorMessage = (message) => __awaiter(this, void 0, void 0, function* () {
    yield vscode.window.showErrorMessage(message);
});
const showErrorMessage_interception = () => __awaiter(this, void 0, void 0, function* () { return yield sleep(1); });
/** * Show message to user
 * dependensies: { vscode.window.showErrorMessage }
 * @param message
 */
const showMessage = (message) => __awaiter(this, void 0, void 0, function* () {
    yield vscode.window.showInformationMessage(message);
});
const showMessage_interception = () => __awaiter(this, void 0, void 0, function* () { return yield sleep(1); });
/** * await wrap for setTimeout. Mostly used for debug asyc.
 * @param ms
 */
const sleep = (ms) => __awaiter(this, void 0, void 0, function* () {
    return new Promise(resolve => setTimeout(resolve, ms));
});
/** * Get the folder path from a file path
 * dependensies: { methods.getDirFromPath }
 * @param path string
 */
const splitPath = (path) => {
    const dir = methods.getDirFromPath(path);
    const splits = path.split('/');
    const name = splits[splits.length - 1];
    return [dir, name];
};
/** * Remove parent-path from a path
 * @param path
 * @param parentPath
 */
const subtractPath = (path, parentPath) => {
    return path.replace(parentPath, '');
};
/** * Format a string to camal-case. Commonly used to define js/ts variable names.
 * (Some-Name => someName, some_name => someName, some.name => someName )
 * All non word seperators will be removed and the word charector after will be transforms to upper case
 * @param str
 */
const toCamelcase = (str) => str[0].toLowerCase() + str.substr(1).replace(/\W+(.)/g, (_match, chr) => chr.toUpperCase());
/** * Remove '/' from start and end of path
 * @param path
 */
const trimDashes = (path) => {
    return path.replace(/(^\/|\/$)/g, '');
};
/** * Remove '/' from start of path
 * @param path
 */
const trimLeadingDash = (path) => {
    return path.replace(/^\//, '');
};
/** * Remove './' from start of path (Will remove / from the start if even if there are no . )
 * @param path
 */
const trimLeadingLocalDash = (path) => {
    return path.replace(/^\.?\//, '');
};
/**
 * export methods
 */
//: IVscBase
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
    isAbsolutePath,
    isDir,
    isSubPath,
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
 * export interception for test mocking:
 */
exports.interceptMethods = (overwrites) => {
    for (const key in overwrites) {
        //@ts-ignore
        methods[key] = overwrites[key];
    }
};
exports.commonInterceptOverwrites = {
    addLeadingLocalDash /*  */,
    ask: ask_interception,
    camalcaseToKebabcase /*  */,
    doesExists: doesExists_interception,
    findFilePaths: findFilePaths_interception,
    getActiveOpenPath: getActiveOpenPath_interception,
    getConfig: getConfig_interception,
    getDirFromPath /*  */,
    getFileContent: getFileContent_interception,
    getPackageDependencies: getPackageDependencies_interception,
    getRootPath: getRootPath_interception,
    isAbsolutePath /*  */,
    isDir: isDir_interception,
    isSubPath /*  */,
    move: move_interception,
    pathAsUnix /*  */,
    realPath: realPath_interception,
    relatrivePathToAbsolutePath /*  */,
    saveAll: saveAll_interception,
    saveFileContent: saveFileContent_interception,
    showErrorMessage: showErrorMessage_interception,
    showMessage: showMessage_interception,
    sleep /* async */,
    splitPath /*  */,
    subtractPath /*  */,
    toCamelcase /*  */,
    trimDashes /*  */,
    trimLeadingDash /*  */,
    trimLeadingLocalDash /*  */
};
exports.interceptFactories = {
    ask: ask_interception_factory,
    doesExists: doesExists_interception_factory,
    findFilePaths: findFilePaths_interception_factory,
    getActiveOpenPath: getActiveOpenPath_interception_factory,
    getConfig: getConfig_interception_factory,
    getFileContent: getFileContent_interception_factory,
    getPackageDependencies: getPackageDependencies_interception_factory,
    getRootPath: getRootPath_interception_factory,
    isDir: isDir_interception_factory,
    realPath: realPath_interception_factory
};
// export const intercept = {
// 	ask: interceptMethods({ ask: ask_interception_factory }),
// 	doesExists: interceptMethods({ doesExists: doesExists_interception_factory }),
// 	findFilePaths: interceptMethods({ findFilePaths: findFilePaths_interception_factory }),
// 	getActiveOpenPath: interceptMethods({ getActiveOpenPath: getActiveOpenPath_interception_factory }),
// 	getConfig: interceptMethods({ getConfig: getConfig_interception_factory }),
// 	getFileContent: interceptMethods({ getFileContent: getFileContent_interception_factory }),
// 	getPackageDependencies: interceptMethods({ getPackageDependencies: getPackageDependencies_interception_factory }),
// 	getRootPath: interceptMethods({ getRootPath: getRootPath_interception_factory }),
// 	isDir: interceptMethods({ isDir: isDir_interception_factory }),
// 	realPath: interceptMethods({ realPath: realPath_interception_factory })
// }
//# sourceMappingURL=vsc-base.newold.js.map