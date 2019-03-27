'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const vscode = require("vscode");
const matchImportRegex = new RegExp(`((?:^|[\s\n]*)@?import\s*[^'"]*['"])([^'"]*)['"]\s*\n?`, 'g');
class Util {
    static isDir(path) {
        return fs.statSync(path).isDirectory();
    }
    static doesExists(path) {
        return fs.existsSync(path);
    }
    static ensureDir(_path) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fs.ensureDir(path.dirname(_path));
        });
    }
    static chunksToLines(chunksAsync) {
        return __asyncGenerator(this, arguments, function* chunksToLines_1() {
            var e_1, _a;
            let previous = '';
            try {
                for (var chunksAsync_1 = __asyncValues(chunksAsync), chunksAsync_1_1; chunksAsync_1_1 = yield __await(chunksAsync_1.next()), !chunksAsync_1_1.done;) {
                    const chunk = chunksAsync_1_1.value;
                    previous += chunk;
                    let eolIndex;
                    while ((eolIndex = previous.indexOf('\n')) >= 0) {
                        // line includes the EOL
                        const line = previous.slice(0, eolIndex + 1);
                        yield yield __await(line);
                        previous = previous.slice(eolIndex + 1);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (chunksAsync_1_1 && !chunksAsync_1_1.done && (_a = chunksAsync_1.return)) yield __await(_a.call(chunksAsync_1));
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (previous.length > 0) {
                yield yield __await(previous);
            }
        });
    }
    static fileReadTest(path, fail, success) {
        return __awaiter(this, void 0, void 0, function* () {
            var e_2, _a;
            let stream = fs.createReadStream(path, {
                flags: 'r',
                encoding: 'utf-8',
                fd: undefined,
                mode: 438,
                autoClose: false,
                highWaterMark: 64 * 1024
            });
            let lineNumber = 0;
            try {
                for (var _b = __asyncValues(Util.chunksToLines(stream)), _c; _c = yield _b.next(), !_c.done;) {
                    const line = _c.value;
                    lineNumber++;
                    if (fail(line, lineNumber)) {
                        stream.destroy();
                        return false;
                    }
                    if (success(line, lineNumber)) {
                        stream.destroy();
                        return { lineNumber };
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return false;
        });
    }
    static lineWithImportAndString(path, str) {
        return __awaiter(this, void 0, void 0, function* () {
            const found = yield Util.fileReadTest(path, 
            /*fail*/ (line, ln) => line.indexOf('import') !== 0 || /^[^\s\n]*$/.test(line) || line !== '', 
            /*succes*/ (line, ln) => line.indexOf(str) >= 0);
            return found;
        });
    }
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    static getFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield vscode.workspace.findFiles('**/*.{css,scss,ts,tsx,js,jsx}', '**/node_modules/**', 100000);
            return files;
        });
    }
    static scanAllOptimized() {
        return __awaiter(this, void 0, void 0, function* () {
            const start = Date.now();
            const files = yield Util.getFiles();
            let foundOne = false;
            yield files.forEach((file) => __awaiter(this, void 0, void 0, function* () {
                // TODO creat generator with test per 'import' instead of line!
                const found = yield Util.lineWithImportAndString(file.fsPath, 'YES IM HERE');
                if (found) {
                    foundOne = true;
                    vscode.window.showInformationMessage('I found you!!!\n' + file.fsPath + '\nLine: ' + found.lineNumber);
                }
            }));
            if (!foundOne) {
                vscode.window.showInformationMessage('Not Found!');
            }
            console.log('scan finished in ' + (Date.now() - start) + 'ms');
        });
    }
    static saveAll() {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.workspace.saveAll(false);
        });
    }
    static getRelativePath(from, to, removeExtraLayerForFile = true) {
        const isDir = Util.isDir(from);
        let relativePath = path.relative(from, to);
        //Files are seens as folder all other files be be one level down, so we have to remove first level:
        if (!isDir && removeExtraLayerForFile) {
            relativePath = relativePath.replace(/^..\//, '');
        }
        return relativePath;
    }
    static log(msg) {
        console.log('-------');
        console.log(msg);
    }
    static updateImportsInSource(source, path, fromPath, toPath) {
        const currentDir = Util.getDirFromPath(path);
        var match;
        while ((match = matchImportRegex.exec(source)) !== null) {
            const importPath = match[2];
            // Todo: absolute path. Path with ./ ect....
            const importPathBase = importPath.replace(/^\//, '');
            const fullImportPath = `${currentDir}/${importPathBase}`;
            if (!Util.doesExists(fullImportPath)) {
                // Todo: Report error
                continue;
            }
            const relativePath = Util.getRelativePath(fullImportPath, fromPath);
            Util.log(relativePath);
            const found = relativePath === '';
            if (found) {
                const toDir = Util.getDirFromPath(toPath);
                let newRelativePath = Util.getRelativePath(path, toPath);
                if (currentDir === toDir) {
                    // Todo: settings?
                    newRelativePath = './' + newRelativePath;
                }
                else {
                    newRelativePath = '/' + newRelativePath;
                }
                // Todo: absolute path. Path with ./ ect....
                Util.log('NEW: ' + newRelativePath);
                source =
                    source.substring(0, match.index + match[1].length) +
                        newRelativePath +
                        source.substring(match.index + match[1].length + match[2].length);
            }
        }
        return source;
    }
    static scallAll(progress) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentPath = Util.getCurrentPath();
            const currenDir = Util.getDirFromPath(currentPath);
            //TEST:
            const newSource = Util.updateImportsInSource(`
			import ''
			import '/folder/test3.js'
		`, '/Users/alfnielsen/Dropbox/Coding/vscode/helloworld/test/index.js', '/Users/alfnielsen/Dropbox/Coding/vscode/helloworld/test/folder/test3.js', '/Users/alfnielsen/Dropbox/Coding/vscode/helloworld/test/folder42/test3-x.js');
            return;
            //
            const newPath = yield vscode.window.showInputBox({
                prompt: 'Which directory would you like to move these to?',
                value: currentPath
            });
            if (!newPath) {
                return;
            }
            // copy original file
            const fileToMoveSource = fs.readFileSync(currentPath, 'utf8');
            yield fs.writeFile(newPath, '');
            // TODO: Update imports in file!
            yield fs.writeFile(newPath, fileToMoveSource);
            // vscode.window.showInformationMessage('I found you!!!\n' + file.fsPath + '\nLine: ' + found.lineNumber)
            const files = yield Util.getFiles();
            yield files.forEach((file) => __awaiter(this, void 0, void 0, function* () {
                if (file.fsPath === currentPath) {
                    return;
                }
                // const relativePath = Util.getRelativePath(currentPath, file.fsPath)
                const source = fs.readFileSync(file.fsPath, 'utf8');
                let newSource = '';
                var match;
                while ((match = Util.matchImportRegex.exec(source)) !== null) {
                    const importPath = match[1];
                    const fullImportPath = `${currenDir}/${importPath}`;
                    if (!Util.doesExists(fullImportPath)) {
                        // Todo: Report error
                        continue;
                    }
                    const relativePath = Util.getRelativePath(fullImportPath, currentPath);
                    Util.log(relativePath);
                    const found = relativePath === '';
                    if (found) {
                        //begin update
                        const foo = 0;
                    }
                }
                // vscode.window.showInformationMessage('I found you!!!\n' + file.fsPath + '\nLine: ' + match[1])
            }));
        });
    }
    static getCurrentPath() {
        const activeEditor = vscode.window.activeTextEditor;
        const document = activeEditor && activeEditor.document;
        return (document && document.fileName) || '';
    }
    static getDirFromPath(_path) {
        return path.dirname(_path);
    }
}
exports.Util = Util;
//# sourceMappingURL=Util.js.map