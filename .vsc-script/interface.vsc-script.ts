import * as fs from 'fs-extra'
import * as vscode from 'vscode'
/**
 * IVscBbase collect interface. DONT WORK If THERE IS Methods arguments!!!!!!
 * Also error on some argument = \[s,s\] beaouce of the comma...
 */
export async function run(uri: vscode.Uri) {
	if (isDir(uri.fsPath)) {
		showErrorMessage('Only works on files!')
	}
	let source = await getFileContent(uri.fsPath)
	let interfacePath = uri.fsPath.replace(/(\.ts)$/, '.interface.ts')
	try {
		const value = runner(source)
		await saveFileContent(interfacePath, value)
	} catch (e) {
		showErrorMessage(e)
	}
	showMessage('Interface done')
}
const runner = (source: string) => {
	const regex = /\n(\/\*\*)([\s\S]*?\*\/)\nconst\s*(\w+)\s*=\s*(async\s*)?(\([^\)]*\))\s*:\s*([\s\S]*?)\s*=>/g
	//	const relatrivePathToAbsolutePath = (path: string, pathRelatriveToPath: string, rootPath: string): string => {
	let interfaces = []
	let m: RegExpExecArray
	while ((m = regex.exec(source)) !== null) {
		const args = m[5].replace(/(\w*):([^=,\n]*?)\s*(=[^,\)\n]*)([,\)\n])/g, '$1?:$2$4')
		interfaces.push(`${m[1]} ${m[2]}\n\treadonly ${m[3]}: ${args} => ${m[6]}`)
	}
	interfaces.sort()
	return `import * as vscode from 'vscode'

export interface IVscBase {

${interfaces.join(`\n\n`)}

}

export type IVscBaseInterceptor = Partial<Record<keyof IVscBase, CallableFunction>>

`
}

const saveFileContent = async (path: string, content: string) => await fs.writeFile(path, content)
const getFileContent = async (path: string) => await fs.readFile(path, 'utf8')
const isDir = (path: string) => fs.statSync(path).isDirectory()
const showMessage = (message: string) => vscode.window.showInformationMessage(message)
const showErrorMessage = (message: string) => vscode.window.showErrorMessage(message)
