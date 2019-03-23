import vsc from './vsc-base'
import * as vscode from 'vscode'

'use strict'
export default class Move {
	public excludePattern?: RegExp = undefined
	public matchImportRegex = /((?:^|[\s\n]*\n)@?import\s*[^'"]*['"])([^'"]*)['"]*/g
	/**
	 * Get all relevant files. (Under rootPath folder!)
	 */
	async findFiles(pattern: string = this.defineGetFilesPattern()) {
		const files = await vsc.findFilePaths(pattern)
		return files
	}
	/**
	 * Define glob pattern for getFiles
	 */
	defineGetFilesPattern() {
		let rootPath = this.getConfig('rootPath', '/src')
		rootPath = vsc.trimLeadingDash(rootPath)
		let filesToHandle = this.getConfig('filesToHandle', 'css,scss,ts,tsx,js,jsx')
		filesToHandle.replace(/\s/, '') //trim spaces!
		const pattern = `${rootPath}/**/*.{${filesToHandle}}`
		return pattern
	}

	getConfig<T>(property: string, defaultValue: T): T {
		return vsc.getConfig('vscMove', property, defaultValue)
	}

	setupExcludePattern() {
		const excludePatternString = this.getConfig('excludePattern', undefined)
		if (excludePatternString) {
			this.excludePattern = new RegExp(excludePatternString)
		}
	}
	/**
	 * The main method that runs
	 * @todo add support for uris (multi select)
	 */
	async run(uri?: vscode.Uri /*, uris?: vscode.Uri[] */) {
		if (uri === undefined) {
			vsc.showMessage('This can only be run from right click context menu.')
			return
		}
		let rootPath = vsc.getRootPath(uri)
		if (!rootPath) {
			vsc.showMessage('File most be in a workspace project.')
			return
		}
		const path = vsc.pathAsUnix(uri.fsPath)

		this.runBase(path, rootPath)
	}

	async runBase(path: string, rootPath: string) {
		const isDir = await vsc.isDir(path)
		// set root to project subfolder
		const rootPathFolder = this.getConfig('rootPath', '/src')
		rootPath = rootPath + rootPathFolder
		// ask user for new path
		let question = isDir ? 'New dir path' : 'New file path'
		const newPath = await vsc.ask(question, path)
		if (!newPath) {
			return
		}
		if (!vsc.doesExists(path)) {
			vsc.showMessage(`File on path not found: ${path}`)
			return
		}
		const startTime = process.hrtime()
		this.setupExcludePattern()
		// rewrite all imports then move then rewrite again!
		try {
			await vsc.move(path, newPath)
		} catch (e) {
			vsc.showErrorMessage(e)
			await vsc.sleep(1000)
			return
		}
		let endTime = process.hrtime(startTime)
		await this.updateImportInAllFilesForMovingItem(isDir, newPath, path, rootPath)
		endTime = process.hrtime(startTime)
		vsc.showMessage(`vsc Move finished in ${endTime[0]}s ${endTime[1]}ms`)
	}

	async updateImportInAllFilesForMovingItem(isDir: boolean, newPath: string, oldPath: string, rootPath: string) {
		let newPathFromRoot = this.getNewPathFromRoot(rootPath, newPath, isDir)
		let regexp = this.getImportReplaceRegExp(oldPath, rootPath, isDir)
		const files = await this.findFiles()
		for (let i = 0; i < files.length; i++) {
			const file = files[i]
			const fileSource = await vsc.getFileContent(file)
			let newSource = this.rewriteImports(file, fileSource, oldPath, rootPath, isDir, regexp, newPathFromRoot, newPath)
			if (fileSource !== newSource) {
				await vsc.saveFileContent(file, newSource)
			}
		}
	}

	matchExcludeList(importPath: string) {
		if (this.excludePattern === undefined) {
			return false
		}
		return this.excludePattern.test(importPath)
	}

	/**
	 *
	 * @param source
	 * @param path
	 * @param rootPath
	 * @param subtractLocalPath Default true. If true absolute paths will be change for imports local to files. (folder/files with import to folder/subfolder will have import ./subfolder instead of folder/subfolder)
	 */
	changeImportsToAbsolutePath(source: string, path: string, rootPath: string, subtractLocalPath = true) {
		source = source.replace(this.matchImportRegex, substring => {
			const match = this.matchImportRegex.exec(source)
			if (match) {
				let importRelatriveToPath = match[2]
				const exclude = this.matchExcludeList(importRelatriveToPath)
				if (!exclude) {
					substring = this.changeMatchedImportToAbsolutePath(match, substring, path, rootPath, subtractLocalPath)
				}
			}
			return substring
		})
		return source
	}

	changeMatchedImportToAbsolutePath(
		match: RegExpExecArray,
		importSource: string,
		path: string,
		rootPath: string,
		subtractLocalPath = true
	) {
		let importRelatriveToPath = match[2]
		let absolutePath = vsc.relatrivePathToAbsolutePath(path, importRelatriveToPath, rootPath)
		if (absolutePath === undefined) {
			// for now we doe this for files not found!!
			absolutePath = importRelatriveToPath
		}
		let newPath: string
		if (subtractLocalPath) {
			newPath = vsc.absolutePathToSubRalative(path, absolutePath, rootPath)
		} else {
			newPath = absolutePath
		}
		// replace relative path with absolute:
		const newSource =
			importSource.substring(0, match[1].length) + newPath + importSource.substring(match[1].length + match[2].length)
		return newSource
	}

	public getImportReplaceRegExp(path: string, rootPath: string, isDir: boolean) {
		let pathFromRoot = vsc.subtractPath(path, rootPath)
		pathFromRoot = vsc.trimLeadingDash(pathFromRoot)
		let regExp: RegExp
		if (isDir) {
			regExp = new RegExp(`((?:^|[\s\n]*\n)@?import\s*[^'"]*['"])${pathFromRoot}(\/[^'"]*['"])`, 'g')
		} else {
			const fileExtensionRegExp = /\.(tsx?|jsx?)$/
			const fileExtensionMatch = pathFromRoot.match(fileExtensionRegExp)
			if (fileExtensionMatch) {
				const fileExtension = fileExtensionMatch[1]
				pathFromRoot = pathFromRoot.replace(fileExtensionRegExp, `(\\.${fileExtension})?`)
			}
			regExp = new RegExp(`((?:^|[\s\n]*\n)@?import\s*[^'"]*['"])${pathFromRoot}(['"])`, 'g')
		}
		return regExp
	}
	public getNewPathFromRoot(rootPath: string, newPath: string, isDir: boolean) {
		let newPathFromRoot = vsc.subtractPath(newPath, rootPath)
		newPathFromRoot = vsc.trimLeadingDash(newPathFromRoot)
		if (!isDir) {
			newPathFromRoot = newPathFromRoot.replace(/\.(tsx?|jsx?)$/, '')
		}
		return newPathFromRoot
	}

	public rewriteImports(
		file: string,
		fileSource: string,
		oldPath: string,
		rootPath: string,
		isDir: boolean,
		regexp: RegExp,
		newPathFromRoot: string,
		newFullPath: string
	) {
		//update to absolute paths
		const isSubPath = vsc.isSubPath(file, oldPath)
		const isMovingFile = file === newFullPath
		const absoluteFilePath = isSubPath || isMovingFile ? oldPath : file
		const sourceWithAbsolutePaths = this.changeImportsToAbsolutePath(fileSource, absoluteFilePath, rootPath, false)
		// Update import with moved files:
		let sourceWithAbsolutePathsUpdated = sourceWithAbsolutePaths
		const match = regexp.exec(sourceWithAbsolutePaths)
		if (match && isDir) {
			sourceWithAbsolutePathsUpdated = sourceWithAbsolutePaths.replace(regexp, `$1${newPathFromRoot}$2`)
		} else if (match) {
			const hasFileExtension = !!match[3]
			if (!hasFileExtension) {
				sourceWithAbsolutePathsUpdated = sourceWithAbsolutePaths.replace(regexp, `$1${newPathFromRoot}$2`)
			} else {
				sourceWithAbsolutePathsUpdated = sourceWithAbsolutePaths.replace(regexp, `$1${newPathFromRoot}$2$3`)
			}
		}
		//update to absolute paths with locals
		const filePath = isSubPath ? newFullPath : file
		const sourceWithAbsoluteLocalPaths = this.changeImportsToAbsolutePath(
			sourceWithAbsolutePathsUpdated,
			filePath,
			rootPath,
			true
		)
		return sourceWithAbsoluteLocalPaths
	}
}
