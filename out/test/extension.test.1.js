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
const vsc_base_1 = require("../vsc-base");
// Defines a Mocha test suite to group tests of similar kind together
suite('Extension Tests', function () {
    const move = new Move_1.default();
    // Defines a Mocha unit test
    test('vsc-base relatrivePathToAbsolutePath', () => {
        const r1 = vsc_base_1.default.relatrivePathToAbsolutePath('c:/root/modules/file1.js', '../file2', 'c:/root/');
        const r2 = vsc_base_1.default.relatrivePathToAbsolutePath('c:/root/modules/file1.ts', './file2', 'c:/root/');
        const r3 = vsc_base_1.default.relatrivePathToAbsolutePath('c:/root/modules/file1.tsx', './sub/file2', 'c:/root/');
        const r4 = vsc_base_1.default.relatrivePathToAbsolutePath('c:/root/modules/file1.jsx', 'modules/file3', 'c:/root/');
        const r5 = vsc_base_1.default.relatrivePathToAbsolutePath('c:/root/modules/file1.jsx', 'react', 'c:/root/');
        const r6 = vsc_base_1.default.relatrivePathToAbsolutePath('c:/root/modules/file1.js', '../modules/file2', 'c:/root/');
        const r7 = vsc_base_1.default.relatrivePathToAbsolutePath('c:/root/modules/file1.js', '../modules2/file4', 'c:/root/');
        const r8 = vsc_base_1.default.relatrivePathToAbsolutePath('c:/root/modules/file1.js', '../file2', 'c:/root');
        const r9 = vsc_base_1.default.relatrivePathToAbsolutePath('c:/root/modules/sub/sub2/file1.js', '../../file2', 'c:/root');
        // #1: relativePath: 'file2'
        // #2: relativePath: 'modules/file2'
        // #3: relativePath: 'modules/sub/file2'
        // #6: relativePath: 'modules/file2'
        // #7: relativePath: 'modules2/file4'
        // #8: relativePath: 'file2'
        assert.equal(r1, 'file2');
        assert.equal(r2, 'modules/file2');
        assert.equal(r3, 'modules/sub/file2');
        assert.equal(r4, 'modules/file3');
        assert.equal(r5, 'react'); // besuce it looks like an absolute path!
        assert.equal(r6, 'modules/file2');
        assert.equal(r7, 'modules2/file4');
        assert.equal(r8, 'file2');
        assert.equal(r8, 'modules/file2');
    });
    // test('relative path in same folder', async () => {
    // 	const rootPath = `c:/project/`
    // 	const path = `c:/project/home/modules/file1.js`
    // 	const source = `import { test1 } './localfile1'`
    // 	const expectedNewSource = `import { test1 } 'home/modules/localfile1'`
    // 	const newSource = await move.changeImportsToAbsolutePath(source, path, rootPath, false)
    // 	assert.equal(newSource, expectedNewSource)
    // })
    // test('relative path in subfolder folder', async () => {
    // 	const rootPath = `c:/project/`
    // 	const path = `c:/project/home/modules/file1.js`
    // 	const source = `import { test1 } './subfolder/localfile1'`
    // 	const expectedNewSource = `import { test1 } 'home/modules/subfolder/localfile1'`
    // 	const newSource = await move.changeImportsToAbsolutePath(source, path, rootPath, false)
    // 	assert.equal(newSource, expectedNewSource)
    // })
    // test('relative path in sibling folder', async () => {
    // 	const rootPath = `c:/project/`
    // 	const path = `c:/project/home/modules/file1.js`
    // 	const source = `import { test1 } '../siblingfolder/localfile1'`
    // 	//intercept.realPath('home/siblingfolder/localfile1')
    // 	const expectedNewSource = `import { test1 } 'home/siblingfolder/localfile1'`
    // 	const newSource = await move.changeImportsToAbsolutePath(source, path, rootPath, false)
    // 	assert.equal(newSource, expectedNewSource)
    // 	interceptMethods(commonInterceptOverwrites) //reset
    // })
});
//# sourceMappingURL=extension.test.1.js.map