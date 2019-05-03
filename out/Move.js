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
const vsc = require("vsc-base");
'use strict';
class Move {
    constructor() {
        this.excludePattern = undefined;
        this.matchImportRegex = /((?:^|[\s\n]*\n)@?import\s*[^'"]*['"])([^'"]*)['"]*/g;
    }
    /**
     * Get all relevant files. (Under rootPath folder!)
     */
    findFiles(pattern = this.defineGetFilesPattern()) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield vsc.findFilePaths(pattern);
            return files;
        });
    }
    /**
     * Define glob pattern for getFiles
     */
    defineGetFilesPattern() {
        let rootPath = this.getConfig('rootPath', '/src');
        rootPath = vsc.trimLeadingDash(rootPath);
        let filesToHandle = this.getConfig('filesToHandle', 'css,scss,ts,tsx,js,jsx');
        filesToHandle.replace(/\s/, ''); //trim spaces!
        const pattern = `${rootPath}/**/*.{${filesToHandle}}`;
        return pattern;
    }
    getConfig(property, defaultValue) {
        return vsc.getConfig('vscMove', property, defaultValue);
    }
    setupExcludePattern() {
        const excludePatternString = this.getConfig('excludePattern', undefined);
        if (excludePatternString) {
            this.excludePattern = new RegExp(excludePatternString);
        }
    }
    /**
     * The main method that runs
     * @todo add support for uris (multi select)
     */
    run(uri /*, uris?: vscode.Uri[] */) {
        return __awaiter(this, void 0, void 0, function* () {
            if (uri === undefined) {
                vsc.showMessage('This can only be run from right click context menu.');
                return;
            }
            let rootPath = vsc.getRootPath(uri.fsPath);
            if (!rootPath) {
                vsc.showMessage('File most be in a workspace project.');
                return;
            }
            const path = vsc.pathAsUnix(uri.fsPath);
            this.runBase(path, rootPath);
        });
    }
    runBase(path, rootPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const isDir = yield vsc.isDir(path);
            // set root to project subfolder
            const rootPathFolder = this.getConfig('rootPath', '/src');
            rootPath = rootPath + rootPathFolder;
            // ask user for new path
            let question = isDir ? 'New dir path' : 'New file path';
            const newPath = yield vsc.ask(question, path);
            if (!newPath) {
                return;
            }
            if (!vsc.doesExists(path)) {
                vsc.showMessage(`File on path not found: ${path}`);
                return;
            }
            const startTime = process.hrtime();
            this.setupExcludePattern();
            // rewrite all imports then move then rewrite again!
            try {
                yield vsc.move(path, newPath);
            }
            catch (e) {
                vsc.showErrorMessage(e);
                yield vsc.sleep(1000);
                return;
            }
            let endTime = process.hrtime(startTime);
            yield this.updateImportInAllFilesForMovingItem(isDir, newPath, path, rootPath);
            endTime = process.hrtime(startTime);
            vsc.showMessage(`vsc Move finished in ${endTime[0]}s ${endTime[1]}ms`);
        });
    }
    updateImportInAllFilesForMovingItem(isDir, newPath, oldPath, rootPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let newPathFromRoot = this.getNewPathFromRoot(rootPath, newPath, isDir);
            let regexp = this.getImportReplaceRegExp(oldPath, rootPath, isDir);
            const files = yield this.findFiles();
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileSource = yield vsc.getFileContent(file);
                let newSource = this.rewriteImports(file, fileSource, oldPath, rootPath, isDir, regexp, newPathFromRoot, newPath);
                if (fileSource !== newSource) {
                    yield vsc.saveFileContent(file, newSource);
                }
            }
        });
    }
    matchExcludeList(importPath) {
        if (this.excludePattern === undefined) {
            return false;
        }
        return this.excludePattern.test(importPath);
    }
    /**
     *
     * @param source
     * @param path
     * @param rootPath
     * @param subtractLocalPath Default true. If true absolute paths will be change for imports local to files. (folder/files with import to folder/subfolder will have import ./subfolder instead of folder/subfolder)
     */
    changeImportsToAbsolutePath(source, path, rootPath, subtractLocalPath = true) {
        source = source.replace(this.matchImportRegex, substring => {
            const match = this.matchImportRegex.exec(source);
            if (match) {
                let importRelatriveToPath = match[2];
                const exclude = this.matchExcludeList(importRelatriveToPath);
                if (!exclude) {
                    substring = this.changeMatchedImportToAbsolutePath(match, substring, path, rootPath, subtractLocalPath);
                }
            }
            return substring;
        });
        return source;
    }
    changeMatchedImportToAbsolutePath(match, importSource, path, rootPath, subtractLocalPath = true) {
        let importRelatriveToPath = match[2];
        let absolutePath = vsc.getAbsolutePathFromRelatrivePath(path, importRelatriveToPath, rootPath);
        if (absolutePath === undefined) {
            // for now we doe this for files not found!!
            absolutePath = importRelatriveToPath;
        }
        let newPath;
        if (subtractLocalPath) {
            newPath = vsc.getSubrelativePathFromAbsoluteRootPath(path, absolutePath, rootPath);
        }
        else {
            newPath = absolutePath;
        }
        // replace relative path with absolute:
        const newSource = importSource.substring(0, match[1].length) + newPath + importSource.substring(match[1].length + match[2].length);
        return newSource;
    }
    getImportReplaceRegExp(path, rootPath, isDir) {
        let pathFromRoot = vsc.subtractPath(path, rootPath);
        pathFromRoot = vsc.trimLeadingDash(pathFromRoot);
        let regExp;
        if (isDir) {
            regExp = new RegExp(`((?:^|[\s\n]*\n)@?import\s*[^'"]*['"])${pathFromRoot}(\/[^'"]*['"])`, 'g');
        }
        else {
            const fileExtensionRegExp = /\.(tsx?|jsx?)$/;
            const fileExtensionMatch = pathFromRoot.match(fileExtensionRegExp);
            if (fileExtensionMatch) {
                const fileExtension = fileExtensionMatch[1];
                pathFromRoot = pathFromRoot.replace(fileExtensionRegExp, `(\\.${fileExtension})?`);
            }
            regExp = new RegExp(`((?:^|[\s\n]*\n)@?import\s*[^'"]*['"])${pathFromRoot}(['"])`, 'g');
        }
        return regExp;
    }
    getNewPathFromRoot(rootPath, newPath, isDir) {
        let newPathFromRoot = vsc.subtractPath(newPath, rootPath);
        newPathFromRoot = vsc.trimLeadingDash(newPathFromRoot);
        if (!isDir) {
            newPathFromRoot = newPathFromRoot.replace(/\.(tsx?|jsx?)$/, '');
        }
        return newPathFromRoot;
    }
    rewriteImports(file, fileSource, oldPath, rootPath, isDir, regexp, newPathFromRoot, newFullPath) {
        //update to absolute paths
        const isSubPath = vsc.isSubPath(file, oldPath);
        const isMovingFile = file === newFullPath;
        const absoluteFilePath = isSubPath || isMovingFile ? oldPath : file;
        const sourceWithAbsolutePaths = this.changeImportsToAbsolutePath(fileSource, absoluteFilePath, rootPath, false);
        // Update import with moved files:
        let sourceWithAbsolutePathsUpdated = sourceWithAbsolutePaths;
        const match = regexp.exec(sourceWithAbsolutePaths);
        if (match && isDir) {
            sourceWithAbsolutePathsUpdated = sourceWithAbsolutePaths.replace(regexp, `$1${newPathFromRoot}$2`);
        }
        else if (match) {
            const hasFileExtension = !!match[3];
            if (!hasFileExtension) {
                sourceWithAbsolutePathsUpdated = sourceWithAbsolutePaths.replace(regexp, `$1${newPathFromRoot}$2`);
            }
            else {
                sourceWithAbsolutePathsUpdated = sourceWithAbsolutePaths.replace(regexp, `$1${newPathFromRoot}$2$3`);
            }
        }
        //update to absolute paths with locals
        const filePath = isSubPath ? newFullPath : file;
        const sourceWithAbsoluteLocalPaths = this.changeImportsToAbsolutePath(sourceWithAbsolutePathsUpdated, filePath, rootPath, true);
        return sourceWithAbsoluteLocalPaths;
    }
}
exports.default = Move;
//# sourceMappingURL=Move.js.map