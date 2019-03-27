import * as fs from 'fs-extra'
import * as vscode from 'vscode'

/**
 * Create a LineReader (generator method) for a ReadStream
 */
const getLineStreamReader = (): generator =>
	async function*(chunksAsync: fs.ReadStream): any {
		let previous = ''
		for await (const chunk of chunksAsync) {
			previous += chunk
			let eolIndex
			while ((eolIndex = previous.indexOf('\n')) >= 0) {
				// line includes the EOL
				const line = previous.slice(0, eolIndex + 1)
				yield line
				previous = previous.slice(eolIndex + 1)
			}
		}
		if (previous.length > 0) {
			yield previous
		}
	}
type generator = (chunksAsync: fs.ReadStream) => any

/**
 * Create a ImportReader (generator method) for a ReadStream
 */
const getImportStreamReader = (): generator =>
	async function*(chunksAsync: fs.ReadStream): any {
		let previous = ''
		for await (const chunk of chunksAsync) {
			previous += chunk

			let eolIndex
			while ((eolIndex = previous.indexOf('\n')) >= 0) {
				// line includes the EOL
				const line = previous.slice(0, eolIndex + 1)
				yield line
				previous = previous.slice(eolIndex + 1)
			}
		}
		if (previous.length > 0) {
			yield previous
		}
	}

/**
 * Get a fs.ReadStream
 * @param path
 */
const getReadStream = (path: string) => {
	const stream = fs.createReadStream(path, {
		flags: 'r',
		encoding: 'utf-8',
		fd: undefined,
		mode: 438, // 0666 in Octal
		autoClose: false,
		highWaterMark: 64 * 1024
	})
	return stream
}
/**
 *
 * @param path
 * @param fail
 * @param success
 */
const fileReadImports = async (
	path: string,
	fail: LineReadCondition,
	success: LineReadCondition
): Promise<
	| false
	| {
			lineNumber: number
	  }
> => {
	let stream = getReadStream(path)
	let lineNumber = 0
	let content = ''
	const importReader = getImportStreamReader()
	for await (const line of importReader(stream)) {
		content += line

		lineNumber++
		if (fail(line, lineNumber)) {
			stream.destroy()
			return false
		}
		if (success(line, lineNumber)) {
			stream.destroy()
			return { lineNumber }
		}
	}
	return false
}
type LineReadCondition = (line: string, lineNumber: number) => boolean

/**
 * Transform an absolute path from root, to a relative path. (Only if the relative path in in same folder or a sub folder.)
 * EX path in a file at 'c:/modules/file1.js' with absolutePathFromRoot: 'modules/sub/file1' => './sub/file1'
 * ( test passed √ )
 * dependensies: { splitPath, subtractPath, trimDashes, trimLeadingDash }
 * @param path
 * @param rootPath
 * @param absolutePathFromRoot
 */
const absoluteFromRootToSubRelative = (path: string, absolutePathFromRoot: string, rootPath: string): string => {
	const [sourceDirPath] = vsc.splitPath(path)
	let sourceDirPathFromRoot = vsc.subtractPath(sourceDirPath, rootPath)
	sourceDirPathFromRoot = vsc.trimDashes(sourceDirPathFromRoot)
	sourceDirPathFromRoot = sourceDirPathFromRoot + '/'
	let absolutePathFromSourceDir = vsc.subtractPath(absolutePathFromRoot, sourceDirPathFromRoot)
	absolutePathFromSourceDir = vsc.trimLeadingDash(absolutePathFromSourceDir)
	if (absolutePathFromSourceDir !== absolutePathFromRoot) {
		absolutePathFromSourceDir = vsc.addLeadingLocalDash(absolutePathFromSourceDir)
	}
	return absolutePathFromSourceDir
}

/**
 * Add './' to start of path
 * @param path
 */
const addLeadingLocalDash = (path: string): string => {
	return './' + path
}

/**
 * Test is a path is directory
 * dependensies: { vscode.window.shoInputBox }
 * @param path
 */
const ask = async (question: string, defaultValue: string): Promise<string | undefined> =>
	await vscode.window.showInputBox({
		prompt: question,
		value: defaultValue
	})

/**
 * Format a string from camel-case to kebab-case. Commonly used to define css class names. (SomeName => some-name)
 * ( test passed √ )
 * @param str
 */
const camalcaseToKebabcase = (str: string): string =>
	str[0].toLowerCase() + str.substr(1).replace(/([A-Z])/g, ([letter]) => `-${letter.toLowerCase()}`)

/**
 * Get clean path. folder/../folder/file => folder/file, folder/./file => file
 * ( test passed √ )
 * @param path
 */
const cleanPath = (path: string): string => {
	path = path.replace(/\/.\//g, '/')
	const reg = /\/\w+\/\.\.\//
	while (reg.test(path)) {
		path = path.replace(reg, '/')
	}
	return path
}

/**
 * Does the folder/file exist
 * dependensies: { fs.existsSync(Faile access) }
 * @param path string
 */
const doesExists = (path: string): boolean => {
	return fs.existsSync(path)
}

/**
 * Get a list off all filePaths in project the matches a glob pattern
 * dependensies: { vscode.workspace.findFiles(File access), methods.pathAsUnix }
 * @param include glob
 * @param exclude glob
 * @param maxResults
 */
const findFilePaths = async (
	include: vscode.GlobPattern,
	exclude: vscode.GlobPattern = '**/node_modules/**',
	maxResults: number = 100000
): Promise<string[]> => {
	const uriFiles = await vscode.workspace.findFiles(include, exclude, maxResults)
	const files = uriFiles.map(uri => vsc.pathAsUnix(uri.fsPath))
	return files
}

/**
 * Get current open file path or undefioned if nonothing is open.
 * dependensies: { vscode.window.activeTextEditor }
 */
const getActiveOpenPath = (): string | undefined => {
	const activeEditor = vscode.window.activeTextEditor
	const document = activeEditor && activeEditor.document
	return (document && document.fileName) || undefined
}

/**
 * Get vscode project config
 * dependensies: { vscode.window.getConfiguration }
 */
const getConfig = <T>(projectName: string, property: string, defaultValue: T): T => {
	return vscode.workspace.getConfiguration(projectName).get<T>(property, defaultValue)
}

/**
 * Get file source
 * dependensies: { fs.readFile(File access) }
 * @param path
 */
const getFileContent = async (path: string): Promise<string> => await fs.readFile(path, 'utf8')

/**
 * Get part of a json object.
 * ( test passed √ )
 * @param json
 * @param keyPath Ex sub.sub.name >> {sub:{sub:{name:'Foo'}}} >> Foo
 */
const getJsonParts = (json: { [name: string]: any }, keyPath: string): any => {
	let current: any = json
	const keySplit = keyPath.split(/\./)
	for (let i = 0; i < keySplit.length; i++) {
		const key = keySplit[i]
		if (current[key] === undefined) {
			return undefined
		}
		current = current[key]
	}
	return current
}

/**
 * Find roots packages and collect the dependencies and devDependencies.
 * Return as: {dependencies:{names:version}[], devDependencies:{names:version}[]}
 * dependensies: { vscode.window.findFiles, methods.getFileContent(File access) }
 */
const getPackageDependencies = async (): Promise<{
	dependencies: { [key: string]: string }[]
	devDependencies: { [key: string]: string }[]
}> => {
	const packageFiles = await vscode.workspace.findFiles('**/package.json', '**/node_modules/**', 1000)
	const res = { dependencies: [], devDependencies: [] }
	for (let i = 0; i < packageFiles.length; i++) {
		const packageFile = packageFiles[i]
		const packageFileSource = await vsc.getFileContent(packageFile.fsPath)
		const packageJsonRoot = JSON.parse(packageFileSource)
		if (!packageJsonRoot) {
			continue
		}
		const dependencies = vsc.getJsonParts(packageJsonRoot, 'dependencies')
		const devDependencies = vsc.getJsonParts(packageJsonRoot, 'devDependencies')
		if (dependencies) {
			res.dependencies = { ...res.dependencies, ...dependencies }
		}
		if (devDependencies) {
			packageJsonRoot.devDependencies = { ...res.devDependencies, ...devDependencies }
		}
	}
	return res
}

/**
 * Get project root for a path or undefined if no project was found.
 * dependensies: { vscode.Uri.parse, vscode.workspace.getWorkspaceFolder, methods.pathAsUnix }
 * @param path
 */
const getRootPath = (uri: vscode.Uri): string | undefined => {
	//const uri = vscode.Uri.parse(path)
	const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri)
	if (!workspaceFolder) {
		return undefined
	}
	let rottPath = workspaceFolder.uri.fsPath
	rottPath = vsc.pathAsUnix(rottPath)
	return rottPath
}

/**
 * Does path start with charactor [a-zA-Z@] (not '/' or './' or '../')
 * @param path
 * @param startWithRegExp? If your project defines another definition of absolute path then overwrite this.
 */
const isAbsolutePath = (path: string, startWithRegExp = /^[a-zA-Z@]/): boolean => {
	return startWithRegExp.test(path)
}

/**
 * Test is a path is directory
 * dependensies: { fs.statSync(Faile access) }
 * @param path
 */
const isDir = (path: string): boolean => {
	return fs.statSync(path).isDirectory()
}

/**
 * Does subpath start with parentPath
 * ( test passed √ )
 * @param path
 * @param parentPath
 */
const isSubPath = (subPath: string, parentPath: string): boolean => {
	parentPath = vsc.trimDashes(parentPath)
	const result = subPath.indexOf(parentPath + '/') === 0
	return result
}

/**
 * Wraps fs.move
 * dependensies: { fs.move(File access) }
 * @param path
 * @param newPathstring
 */
const move = async (path: string, newPath: string): Promise<void> => {
	await fs.move(path, newPath)
}

/**
 * Reaplve all '\\'  with '/'
 * @param path
 */
const pathAsUnix = (path: string): string => {
	return path.replace(/\\/g, '/')
}

/**
 * Transform a relative path to an abspolute path.
 * ( test passed √ )
 * dependensies: { cleanPath, trimLeadingDash, subtractPath, getDirFromPath, trimLeadingLocalDash}
 * @param path File from where the relative path begins
 * @param pathRelatriveToPath The relative path
 * @param rootPath The root path
 * @param realPathTest Test if the real  The root path
 */
const relatrivePathToAbsolutePath = (path: string, pathRelatriveToPath: string, rootPath: string): string => {
	if (vsc.isAbsolutePath(pathRelatriveToPath)) {
		return pathRelatriveToPath
	}
	let [dir] = vsc.splitPath(path)
	dir += '/'
	const relativePath = dir + pathRelatriveToPath
	let cleanRelativePath = vsc.cleanPath(relativePath)
	let absolutePathToRelative = vsc.subtractPath(cleanRelativePath, rootPath)
	absolutePathToRelative = vsc.trimLeadingDash(absolutePathToRelative)
	return absolutePathToRelative
}

/**
 * Save All files
 * dependensies: { vscode.workspace.saveAll(File access) }
 */
const saveAll = async (): Promise<void> => {
	await vscode.workspace.saveAll(false)
}

/**
 * Save file
 * dependensies: { fs.writeFile(File access) }
 * @param path
 * @param content
 */
const saveFileContent = async (path: string, content: string): Promise<void> => {
	await fs.writeFile(path, content)
}

/**
 * Show error message to user
 * dependensies: { vscode.window.showErrorMessage }
 * @param message
 */
const showErrorMessage = async (message: string): Promise<void> => {
	await vscode.window.showErrorMessage(message)
}

/**
 * Show message to user
 * dependensies: { vscode.window.showErrorMessage }
 * @param message
 */
const showMessage = async (message: string): Promise<void> => {
	await vscode.window.showInformationMessage(message)
}

/**
 * await wrap for setTimeout. Mostly used for debug asyc.
 * @param ms
 */
const sleep = async (ms: number): Promise<void> => {
	return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Get the folder path from a file path
 * ( test passed √ )
 * dependensies: { methods.getDirFromPath }
 * @param path string
 */
const splitPath = (path: string): [string, string] => {
	path = vsc.pathAsUnix(path)
	const splits = path.split('/')
	const name = splits.pop() || ''
	const dir = splits.join('/')
	return [dir, name]
}

/**
 * Remove parent-path from a path
 * @param path
 * @param parentPath
 */
const subtractPath = (path: string, parentPath: string): string => {
	const regexp = new RegExp(`^${parentPath}`)
	return path.replace(regexp, '')
}

/**
 * Format a string to camal-case. Commonly used to define js/ts variable names.
 * (Some-Name => someName, some_name => someName, some.name => someName )
 * All non word seperators will be removed and the word charector after will be transforms to upper case
 * ( test passed √ )
 * @param str
 */
const toCamelcase = (str: string): string =>
	str[0].toLowerCase() + str.substr(1).replace(/\W+(.)/g, (_match, chr) => chr.toUpperCase())

/**
 * Remove '/' from start and end of path
 * @param path
 */
const trimDashes = (path: string): string => {
	return path.replace(/(^\/|\/$)/g, '')
}

/**
 * Remove '/' from start of path
 * @param path
 */
const trimLeadingDash = (path: string): string => {
	return path.replace(/^\//, '')
}

/**
 * export methods
 */
const vsc /* IVscBase */ = {
	absolutePathToSubRalative: absoluteFromRootToSubRelative,
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
}
export default vsc
