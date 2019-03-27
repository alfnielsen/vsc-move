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
const vsc = require("./vsc-base");
'use strict';
class Move {
    constructor() {
        this.excludePattern = undefined;
        this.matchImportRegex = /((?:^|[\s\n]*\n)@?import\s*[^'"]*['"])([^'"]*)['"]*/g;
    }
    /**
     * Get all relevant files. (Under rootPath folder!)
     */
    getFiles(pattern = this.defineGetFilesPattern()) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield vsc.getFiles(pattern);
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
    /**
     * The main method that runs
     * @todo add support for uris (multi select)
     */
    run(uri, uris) {
        return __awaiter(this, void 0, void 0, function* () {
            if (uri === undefined) {
                vsc.showMessage('This can only be run from right click context menu.');
                return;
            }
            const path = vsc.pathAsUnix(uri.fsPath);
            const isDir = yield vsc.isDir(path);
            let rootPath = vsc.getRootPath(uri);
            // set root to project subfolder
            const rootPathFolder = this.getConfig('rootPath', '/src');
            rootPath = rootPath + rootPathFolder;
            // ask user for new path
            let question = isDir ? 'New dir path' : 'New file path';
            const newPath = yield vsc.ask(question, path);
            if (!newPath) {
                return;
            }
            this.setupExcludePattern();
            // rewrite all imports then move then rewrite again!
            yield this.rewriteAllImport(rootPath, false);
            try {
                yield fs.move(path, newPath);
            }
            catch (e) {
                yield vsc.showErrorMessage(e);
                return;
            }
            yield this.updateImportInAllFilesForMovingItem(isDir, newPath, path, rootPath);
            yield this.rewriteAllImport(rootPath, true);
            vsc.showMessage('vsc Move finished');
        });
    }
    setupExcludePattern() {
        const excludePatternString = this.getConfig('excludePattern', undefined);
        if (excludePatternString) {
            this.excludePattern = new RegExp(excludePatternString);
        }
    }
    rewriteAllImport(rootPath, subtractLocalPath) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * @todo Maybe this is to hardcore!!!
             * (It updates all files to absolute paths!!!!!!
             *  - then move around
             *  - then update all to absolute path again, but with local ref aka './' for sub refs
             */
            let files = yield this.getFiles();
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const source = yield vsc.getFileContent(file.fsPath);
                let newSource = yield this.changeImportsToAbsolutePath(source, file.fsPath, rootPath, subtractLocalPath);
                yield vsc.saveFileContent(file.fsPath, newSource);
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
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    changeMatchedImportToAbsolutePath(match, source, path, rootPath, subtractLocalPath = true) {
        let importRelatriveToPath = match[2];
        importRelatriveToPath = vsc.trimLeadingLocalDash(importRelatriveToPath);
        const absolutePath = vsc.relatrivePathToAbsolutePath(path, importRelatriveToPath, rootPath);
        // if (absolutePath === importRelatriveToPath) {
        // 	return source
        // }
        let newPath;
        if (subtractLocalPath) {
            newPath = this.subtractLocalPath(path, rootPath, absolutePath);
        }
        else {
            newPath = absolutePath;
        }
        // replace relative path with absolute:
        const newSource = source.substring(0, match[1].length) + newPath + source.substring(match[1].length + match[2].length);
        return newSource;
    }
    subtractLocalPath(path, rootPath, absolutePath) {
        const sourceDirPath = vsc.getDirFromPath(path);
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
    }
    updateImportInAllFilesForMovingItem(isDir, newPath, path, rootPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let pathFromRoot = vsc.subtractPath(path, rootPath);
            pathFromRoot = vsc.trimLeadingDash(pathFromRoot);
            pathFromRoot = pathFromRoot.replace(/\.(tsx?|jsx?)$/, '');
            let newPathFromRoot = vsc.subtractPath(newPath, rootPath);
            newPathFromRoot = vsc.trimLeadingDash(newPathFromRoot);
            let regexp;
            if (isDir) {
                regexp = new RegExp(`((?:^|[\s\n]*\n)@?import\s*[^'"]*['"])${pathFromRoot}(\/[^'"]*['"])`, 'g');
            }
            else {
                newPathFromRoot = newPathFromRoot.replace(/\.(tsx?|jsx?)$/, '');
                regexp = new RegExp(`((?:^|[\s\n]*\n)@?import\s*[^'"]*['"])${pathFromRoot}(['"])`, 'g');
            }
            const files = yield this.getFiles();
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const source = yield vsc.getFileContent(file.fsPath);
                if (source.match(regexp)) {
                    const newSource = source.replace(regexp, `$1${newPathFromRoot}$2`);
                    yield vsc.saveFileContent(file.fsPath, newSource);
                }
            }
        });
    }
}
exports.default = Move;
//# sourceMappingURL=Move.1.js.map