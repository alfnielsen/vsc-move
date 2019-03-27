"use strict";
//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'assert' provides assertion methods from node
const assert = require("assert");
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';
const Move_1 = require("../Move");
// import { mock } from 'simple-mock'
// Defines a Mocha test suite to group tests of similar kind together
suite('Extension Tests', function () {
    const move = new Move_1.default();
    // Defines a Mocha unit test
    test('getImportReplaceRegExp-file', () => {
        const path = 'c:/main/file1.js';
        const rootPath = 'c:';
        const isDir = false;
        const regexp = move.getImportReplaceRegExp(path, rootPath, isDir);
        assert.equal(regexp.toString(), `/((?:^|[\s\n]*\n)@?import\s*[^'"]*['"])main\\/file1(\\.js)?(['"])/g`);
        //test regexp:
        let regexpRes = `import 'main/file1'`.replace(regexp, 'FullPath');
        assert.equal(regexpRes, 'FullPath');
        //test regexp:
        regexpRes = `import 'main/file1.js'`.replace(regexp, 'FullPath');
        assert.equal(regexpRes, 'FullPath');
    });
    test('getImportReplaceRegEx-dir', () => {
        const path = 'c:/main';
        const rootPath = 'c:';
        const isDir = true;
        const regexp = move.getImportReplaceRegExp(path, rootPath, isDir);
        assert.equal(regexp.toString(), `/((?:^|[\s\n]*\n)@?import\s*[^'"]*['"])main(\\/[^'"]*['"])/g`);
        //test regexp:
        let regexpRes = `import 'main/somesub/file.ts'`.replace(regexp, '$1newpath$2');
        assert.equal(regexpRes, `import 'newpath/somesub/file.ts'`);
    });
    test('rewriteImports file', () => {
        const file = 'c:/other/file22.js';
        const fileSource = `import '../main/file1'`;
        const oldPath = 'c:/main/file1.js';
        const newPath = 'c:/modules/main/file1.js';
        const rootPath = 'c:';
        const isDir = false;
        const newPathFromRoot = move.getNewPathFromRoot(rootPath, newPath, isDir);
        const regexp = move.getImportReplaceRegExp(oldPath, rootPath, isDir);
        const newSource = move.rewriteImports(file, fileSource, oldPath, rootPath, isDir, regexp, newPathFromRoot, newPath);
        assert.equal(newSource, `import 'modules/main/file1'`);
    });
    test('rewriteImports file multiple imports', () => {
        const file = 'c:/other/file22.js';
        const fileSource = `
import '../main/filekeepOne'
import '../main/filekeep.tsx'
import '../main/filekeepOther.js'
`;
        const oldPath = 'c:/main/filekeep.tsx';
        const newPath = 'c:/modules/main/filekeep.tsx';
        const rootPath = 'c:';
        const isDir = false;
        const newPathFromRoot = move.getNewPathFromRoot(rootPath, newPath, isDir);
        const regexp = move.getImportReplaceRegExp(oldPath, rootPath, isDir);
        const newSource = move.rewriteImports(file, fileSource, oldPath, rootPath, isDir, regexp, newPathFromRoot, newPath);
        assert.equal(newSource, `
import 'main/filekeepOne'
import 'modules/main/filekeep.tsx'
import 'main/filekeepOther.js'
`);
    });
    test('rewriteImports file scss', () => {
        const file = 'c:/other/file22.js';
        const fileSource = `import '../main/scssFile1.scss'`;
        const oldPath = 'c:/main/scssFile1.scss';
        const newPath = 'c:/modules/main/scssFile1.scss';
        const rootPath = 'c:';
        const isDir = false;
        const newPathFromRoot = move.getNewPathFromRoot(rootPath, newPath, isDir);
        const regexp = move.getImportReplaceRegExp(oldPath, rootPath, isDir);
        const newSource = move.rewriteImports(file, fileSource, oldPath, rootPath, isDir, regexp, newPathFromRoot, newPath);
        assert.equal(newSource, `import 'modules/main/scssFile1.scss'`);
    });
    test('rewriteImports dir', () => {
        const file = 'c:/other/file22.js';
        const fileSource = `
import '../main/dirFilemain1.js'
import './dirFile'
import './sub/dirFile1.scss'
import 'main/sub/dirFile2.tsx'
`;
        const fileSourceAssert = `
import 'modules/main/dirFilemain1.js'
import './dirFile'
import './sub/dirFile1.scss'
import 'modules/main/sub/dirFile2.tsx'
`;
        const oldPath = 'c:/main';
        const newPath = 'c:/modules/main';
        const rootPath = 'c:';
        const isDir = true;
        const newPathFromRoot = move.getNewPathFromRoot(rootPath, newPath, isDir);
        const regexp = move.getImportReplaceRegExp(oldPath, rootPath, isDir);
        const newSource = move.rewriteImports(file, fileSource, oldPath, rootPath, isDir, regexp, newPathFromRoot, newPath);
        assert.equal(newSource, fileSourceAssert);
    });
});
//# sourceMappingURL=extension.test.js.map