import * as fs from 'fs-extra'
import * as path from 'path'
import * as vscode from 'vscode'

'use strict'
export default class Move {
	/**
	 * Save all files.
	 * Before scanning we need to save all files!!!
	 */
	async saveAll() {
		await vscode.workspace.saveAll(false)
	}

	async getFileContent(path: string) {
		return await fs.readFile(path, 'utf8')
	}

	async saveFileContent(path: string, content: string) {
		await fs.writeFile(path, content)
	}

	/**
	 * Reaplve all '\\'  with '/'
	 */
	pathAsUnix(path: string) {
		return path.replace(/\\/g, '/');
	}

	/**
	 * Get all relevant files. (Under rootPath folder!)
	 */
	async getFiles(pattern?: string) {
		if (pattern === undefined) {
			let rootPath = this.getConfig('rootPath', '/src')
			rootPath = this.trimLeadingDash(rootPath);
			let filesToHandle = this.getConfig('filesToHandle', 'css,scss,ts,tsx,js,jsx')
			filesToHandle.replace(/\s/, '') //trim spaces!
			pattern = `${rootPath}/**/*.{${filesToHandle}}`
		}
		const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**', 100000)
		return files
	}
	/**
	 * Get fs stats
	 * @param path string
	 */
	async getPathStats(path: string) {
		return await fs.stat(path)
	}
	/**
	 * Is the item a directory
	 * @param path string
	 */
	async isDir(path: string) {
		const stats = await this.getPathStats(path)
		return stats.isDirectory()
	}
	/**
	 * Does the folder/file exist
	 * @param path string
	 */
	doesExists(path: string): boolean {
		return fs.existsSync(path)
	}
	/**
	 * Get the folder path from a file path
	 * @param _path string
	 */
	getDirFromPath(_path: string) {
		let dir = path.dirname(_path)
		dir = this.pathAsUnix(dir)
		return dir;
	}
	/**
	 * Get the folder path from a file path
	 * @param path string
	 */
	splitPath(path: string) {
		const dir = this.getDirFromPath(path)
		const splits = path.split('/')
		const name = splits[splits.length - 1]
		return [dir, name]
	}

	/**
	 * path remove rootPath from a Path
	 * User/some/project/underproject/folder1 -> underproject/folder1
	 * @param path
	 * @param rootPath
	 */

	subtractPath(path: string, rootPath: string) {
		return path.replace(rootPath, '')
	}

	/**
	 * Remove '/' from start of path
	 * @param path
	 */
	trimLeadingDash(path: string) {
		return path.replace(/^\//, '')
	}

	/**
	 * Remove './' from start of path
	 * @param path
	 */
	trimLeadingLocalDash(path: string) {
		return path.replace(/^\.\//, '')
	}
	/**
	 * Remove './' from start of path
	 * @param path
	 */
	addLeadingLocalDash(path: string) {
		return './' + path
	}

	/**
	 * Get path from root
	 */
	relatrivePathToAbsolutePath(path: string, pathRelatriveToPath: string, rootPath: string) {
		/**
		 * @todo: We need to make all libs so we can ignore import to them.
		 * (In this version the try pattern will ignore them..)
		 */
		pathRelatriveToPath = this.trimLeadingDash(pathRelatriveToPath)
		let [dir, name] = this.splitPath(path)
		if (pathRelatriveToPath.match(/[^\/]/) && dir.match(/[^\/]$/)) {
			dir += '/'
		}
		const relativePath = dir + pathRelatriveToPath
		// Clean up weird paths.. (folder/../folder/some -> folder/some  )
		let cleanRelativePath = this.realPath(relativePath)
		if (cleanRelativePath === undefined) {
			//this.showError(`Error in import path. ErrorMessge: ${e} file: ${path} `)
			//NOTE: all kind of modules will not be here!! So just return import...
			return pathRelatriveToPath
		}

		let absolutePathToRelative = this.subtractPath(cleanRelativePath, rootPath)
		//trim leading '/'
		absolutePathToRelative = this.trimLeadingDash(absolutePathToRelative)

		return absolutePathToRelative
	}

	/**
	 * Get real path. This cleans path and test for path where ending is not written like (component instead of component.js)
	 * returns [added extension, readlpathWithNewEnding ]
	 * @param path
	 */
	realPath(path: string) {
		let realPath: string | undefined
		try {
			realPath = fs.realpathSync(path)
			realPath = this.pathAsUnix(realPath)
			return realPath
		} catch (e) {}
		try {
			realPath = fs.realpathSync(path + '.js')
			realPath = realPath.replace(/\.js$/, '')
			realPath = this.pathAsUnix(realPath)
			return realPath
		} catch (e) {}
		try {
			realPath = fs.realpathSync(path + '.ts')
			realPath = realPath.replace(/\.ts$/, '')
			realPath = this.pathAsUnix(realPath)
			return realPath
		} catch (e) {}
		return undefined
	}

	getConfig<T>(property: string, defaultValue: T): T {
		return vscode.workspace.getConfiguration('vscMove').get<T>(property, defaultValue)
	}

	/**
	 * Show information message in vscode
	 */
	showMessage = (message: string) => vscode.window.showInformationMessage(message)
	/**
	 * Show error message in vscode
	 */
	showError = (message: string) => vscode.window.showErrorMessage(message)

	/**
	 * Get root path for project
	 */
	getRootPath = (uri: vscode.Uri): string => {
		const folder = vscode.workspace.getWorkspaceFolder(uri)
		if (!folder) {
			throw new Error('getRootPath was called with incorrect uri! (The uri must be within the project!)')
		}
		const rootPath = this.pathAsUnix(folder.uri.fsPath);
		return rootPath;
	}
	/**
	 * Promp vscode user
	 */
	ask = async (question: string, devaultValue: string) => {
		return await vscode.window.showInputBox({
			prompt: question,
			value: devaultValue
		})
	}

	/**
	 * The main method that runs
	 */
	async run(uri?: vscode.Uri) {
		if (uri === undefined) {
			this.showMessage('This can only be run from right click context menu.')
			return
		}
		const path = this.pathAsUnix(uri.fsPath)
		const isDir = await this.isDir(path)
		let rootPath = this.getRootPath(uri)
		// set root to project subfolder
		const rootPathFolder = this.getConfig('rootPath', '/src')
		rootPath = rootPath + rootPathFolder
		// ask user for new path
		let question = isDir ? 'New dir path' : 'New file path'
		const newPath = await this.ask(question, path)
		if (!newPath) {
			return
		}
		// rewrite all imports then move then rewrite again!
		await this.rewriteAllImport(rootPath, false)
		await fs.move(path, newPath)
		await this.updateImportInAllFilesForMovingItem(newPath, path, rootPath)
		await this.rewriteAllImport(rootPath, true)
		this.showMessage('vsc Move finished')
	}

	async rewriteAllImport(rootPath: string, subtractLocalPath: boolean) {
		/**
		 * @todo Maybe this is to hardcore!!!
		 * (It updates all files to absolute paths!!!!!!
		 *  - then move around
		 *  - then update all to absolute path again, but with local ref aka './' for sub refs
		 */
		let files = await this.getFiles()
		for (let i = 0; i < files.length; i++) {
			const file = files[i]
			const source = await this.getFileContent(file.fsPath)
			let newSource = await this.changeImportsToAbsolutePath(source, file.fsPath, rootPath, subtractLocalPath)
			await this.saveFileContent(file.fsPath, newSource)
		}
	}

	matchImportRegex = /((?:^|[\s\n]*\n)@?import\s*[^'"]*['"])([^'"]*)['"]*/g
	/**
	 *
	 * @param source
	 * @param path
	 * @param rootPath
	 * @param subtractLocalPath Default true. If true absolute paths will be change for imports local to files. (folder/files with import to folder/subfolder will have import ./subfolder instead of folder/subfolder)
	 */
	async changeImportsToAbsolutePath(source: string, path: string, rootPath: string, subtractLocalPath = true) {
		source = source.replace(this.matchImportRegex, substring => {
			const match = this.matchImportRegex.exec(source)
			if (match) {
				substring = this.changeMatchedImportToAbsolutePath(match, substring, path, rootPath, subtractLocalPath)
			}
			return substring
		})
		return source
	}
	changeMatchedImportToAbsolutePath(
		match: RegExpExecArray,
		source: string,
		path: string,
		rootPath: string,
		subtractLocalPath = true
	) {
		let importRelatriveToPath = match[2]
		importRelatriveToPath = this.trimLeadingLocalDash(importRelatriveToPath)
		const absolutePath = this.relatrivePathToAbsolutePath(path, importRelatriveToPath, rootPath)
		// if (absolutePath === importRelatriveToPath) {
		// 	return source
		// }
		let newPath: string
		if (subtractLocalPath) {
			//subtract source folder path:
			const sourceDirPath = this.getDirFromPath(path)
			let sourceDirPathFromRoot = this.subtractPath(sourceDirPath, rootPath)
			sourceDirPathFromRoot = this.trimLeadingDash(sourceDirPathFromRoot)
			let absolutePathFromSourceDir = this.subtractPath(absolutePath, sourceDirPathFromRoot)
			absolutePathFromSourceDir = this.trimLeadingDash(absolutePathFromSourceDir)
			//const isSubPath = this.isSubPath(absolutePathFromSourceDir, absolutePath)
			if (absolutePathFromSourceDir !== absolutePath) {
				absolutePathFromSourceDir = this.addLeadingLocalDash(absolutePathFromSourceDir)
			}
			newPath = absolutePathFromSourceDir
		} else {
			newPath = absolutePath
		}
		// replace relative path with absolute:
		const newSource =
			source.substring(0, match[1].length) + newPath + source.substring(match[1].length + match[2].length)
		return newSource
	}

	async updateImportInAllFilesForMovingItem(newPath: string, path: string, rootPath: string) {
		let pathFromRoot = this.subtractPath(path, rootPath)
		pathFromRoot = this.trimLeadingDash(pathFromRoot);
		pathFromRoot = pathFromRoot.replace(/\.(tsx?|jsx?)$/,'');
		let newPathFromRoot = this.subtractPath(newPath, rootPath)
		newPathFromRoot = this.trimLeadingDash(newPathFromRoot);
		// test remove of extenstion like .ts or .js
		newPathFromRoot = newPathFromRoot.replace(/\.(tsx?|jsx?)$/,'');
		const regexp = new RegExp(`((?:^|[\s\n]*\n)@?import\s*[^'"]*['"])${pathFromRoot}(\/[^'"]*)?(['"])`,'g')
		const files = await this.getFiles()
		for (let i = 0; i < files.length; i++) {
			const file = files[i]
			const source = await this.getFileContent(file.fsPath)
			if(source.match(regexp)){
				const newSource = source.replace(regexp, `$1${newPathFromRoot}$2$3`)
				await this.saveFileContent(file.fsPath, newSource)
			}
		}
	}
}
