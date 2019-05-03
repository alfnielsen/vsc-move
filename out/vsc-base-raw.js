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
/**
 * Transform an absolute path from root, to a sub-relative path.
 * @param path
 * @param rootPath
 * @param absolutePathFromRoot
 * @see http://vsc-base.org/#absolutePathFromRootToSubRelative
 * @returns string
 */
const absolutePathFromRootToSubRelative = (path, absolutePathFromRoot, rootPath) => {
    const [sourceDirPath] = vsc.splitPath(path);
    let sourceDirPathFromRoot = vsc.subtractPath(sourceDirPath, rootPath);
    sourceDirPathFromRoot = sourceDirPathFromRoot + '/';
    let absolutePathFromSourceDir = vsc.subtractPath(absolutePathFromRoot, sourceDirPathFromRoot);
    if (absolutePathFromSourceDir !== absolutePathFromRoot) {
        absolutePathFromSourceDir = vsc.addLeadingLocalDash(absolutePathFromSourceDir);
    }
    return absolutePathFromSourceDir;
};
/**
 * Add './' to start of path
 * @param path
 * @see http://vsc-base.org/#addLeadingLocalDash
 * @returns string
 */
const addLeadingLocalDash = (path) => {
    return './' + path;
};
/**
 * Format a string from camel-case to kebab-case. Commonly used to define css class names. (SomeName => some-name)
 * @param str
 * @see http://vsc-base.org/#camalcaseToKebabcase
 * @returns any
 */
const camalcaseToKebabcase = (str) => str[0].toLowerCase() + str.substr(1).replace(/([A-Z])/g, ([letter]) => `-${letter.toLowerCase()}`);
/**
 * Get clean path. folder/../folder/file => folder/file, folder/./file => file
 * @param path
 * @see http://vsc-base.org/#cleanPath
 * @returns any
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
 * Get part of a json object.
 * @param json
 * @param keyPath Ex sub.sub.name >> {sub:{sub:{name:'Foo'}}} >> Foo
 * @see http://vsc-base.org/#getJsonParts
 * @returns any
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
 * Does path start with charactor [a-zA-Z@] (not '/' or './' or '../')
 * @param path
 * @param startWithRegExp? If your project defines another definition of absolute path then overwrite this.
 * @see http://vsc-base.org/#isAbsolutePath
 * @returns any
 */
const isAbsolutePath = (path, startWithRegExp = /^[a-zA-Z@]/) => {
    return startWithRegExp.test(path);
};
/**
 * Does subpath start with parentPath
 * @param path
 * @param parentPath
 * @see http://vsc-base.org/#isSubPath
 * @returns any
 */
const isSubPath = (subPath, parentPath) => {
    parentPath = vsc.trimDashes(parentPath);
    const result = subPath.indexOf(parentPath + '/') === 0;
    return result;
};
/**
 * Joins to paths.
 * @param path1
 * @param path2
 * @see http://vsc-base.org/#joinPaths
 * @returns any
 */
const joinPaths = (path1, path2) => {
    path1 = vsc.trimDashes(path1);
    path2 = vsc.trimDashes(path2);
    const result = path1 + '/' + path2;
    return result;
};
/**
 * Reaplve all '\\'  with '/'
 * @param path
 * @see http://vsc-base.org/#pathAsUnix
 * @returns any
 */
const pathAsUnix = (path) => {
    return path.replace(/\\/g, '/');
};
/**
 * Generate relative path between two paths.
 * @param fromPath
 * @param toPath
 * @see http://vsc-base.org/#relatrivePath
 * @returns any
 */
const relatrivePath = (fromPath, toPath) => {
    const sharedPath = vsc.sharedPath(fromPath, toPath);
    const [fromDir] = vsc.splitPath(fromPath);
    const [toDir] = vsc.splitPath(toPath);
    const fromPathDownToShared = vsc.subtractPath(fromDir, sharedPath);
    let toPathDownToShared = vsc.subtractPath(toDir, sharedPath);
    const backPath = fromPathDownToShared
        .split(/\//)
        .map(_ => '../')
        .join('');
    const relativePath = backPath + toPathDownToShared;
    return relativePath;
};
/**
 * Transform a relative path to an abspolute path.
 * @param path File from where the relative path begins
 * @param pathRelatriveToPath The relative path
 * @param rootPath The root path
 * @param realPathTest Test if the real  The root path
 * @see http://vsc-base.org/#relatrivePathToAbsolutePath
 * @returns any
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
 * Return the path that are shared. (Return '' if no path are shared).
 * @param path1
 * @param path2
 * @see http://vsc-base.org/#sharedPath
 * @returns any
 */
const sharedPath = (path1, path2) => {
    const path1Parts = path1.split(/\//);
    const path2Parts = path2.split(/\//);
    const shared = [];
    for (let i = 0; i < path1Parts.length; i++) {
        if (!path2Parts[i] || path1Parts[i] !== path2Parts[i]) {
            break;
        }
        shared.push(path1Parts[i]);
    }
    const finalShared = shared.join('/');
    return finalShared;
};
/**
 * await wrap for setTimeout. Mostly used for debug asyc.
 * @param ms
 * @see http://vsc-base.org/#sleep
 * @returns any
 */
const sleep = (ms) => __awaiter(this, void 0, void 0, function* () {
    return new Promise(resolve => setTimeout(resolve, ms));
});
/**
 * Split path into dir and file
 * @param path
 * @see http://vsc-base.org/#splitPath
 * @returns [dir, name]
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
 * @param trimDashes default true
 * @see http://vsc-base.org/#subtractPath
 * @returns string
 */
const subtractPath = (path, parentPath, trimDashes = true) => {
    const regexp = new RegExp(`^${parentPath}`);
    let newPath = path.replace(regexp, '');
    if (trimDashes) {
        newPath = vsc.trimDashes(newPath);
    }
    return newPath;
};
/**
 * Format a string to camal-case. Commonly used to define js/ts variable names.
 * (Some-Name => someName, some_name => someName, some.name => someName )
 * All non word seperators will be removed and the word charector after will be transforms to upper case
 * @param str
 * @see http://vsc-base.org/#toCamelcase
 * @returns string
 */
const toCamelcase = (str) => str[0].toLowerCase() + str.substr(1).replace(/[^a-zA-Z]+(.)/g, (_match, chr) => chr.toUpperCase());
/**
 * Remove '/' from start and end of path
 * @param path
 * @see http://vsc-base.org/#trimDashes
 * @returns string
 */
const trimDashes = (path) => {
    return path.replace(/(^\/|\/$)/g, '');
};
/**
 * Remove '/' from start of path
 * @param path
 * @see http://vsc-base.org/#trimLeadingDash
 * @returns string
 */
const trimLeadingDash = (path) => {
    return path.replace(/^\//, '');
};
/**
 * export methods
 */
const vsc /* IVscBase */ = {
    absolutePathToSubRalative: absolutePathFromRootToSubRelative,
    addLeadingLocalDash,
    camalcaseToKebabcase,
    cleanPath,
    getJsonParts,
    isAbsolutePath,
    isSubPath,
    joinPaths,
    relatrivePath,
    pathAsUnix,
    relatrivePathToAbsolutePath,
    sharedPath,
    sleep,
    splitPath,
    subtractPath,
    toCamelcase,
    trimDashes,
    trimLeadingDash
};
exports.default = vsc;
//# sourceMappingURL=vsc-base-raw.js.map