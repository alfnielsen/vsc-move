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
	let interfacePath = uri.fsPath.replace(/(\.ts)$/, '.new.ts')
	try {
		const value = runner(source)
		await saveFileContent(interfacePath, value)
	} catch (e) {
		showErrorMessage(e)
	}
	showMessage('Interface done')
}
const runner = (source: string) => {
	const regex = /\n\/\*\*/g
	let parts = source.split(regex)
	// return JSON.stringify(parts, null, 2)
	const first = parts.shift()
	parts.pop() // intercept export
	parts.pop() // methods export
	const partsObj = parts.map(part => {
		part = part.replace(/^\n*|\n*$/, '')
		const nameMatch = part.match(/\nconst (\w+)/)
		if (!nameMatch) {
			return { name: 'x-' + part.substr(0, 20) }
		}
		const name = nameMatch[1]
		const hasDefaultInterception = new RegExp(`\nconst ${name}_interception `).test(part)
		let defaultInterception: string
		if (hasDefaultInterception) {
			defaultInterception = `${name}_interception`
		}
		const hasInterceptionFactory = new RegExp(`\nconst ${name}_interception_factory `).test(part)
		let interceptionFactory: string
		if (hasInterceptionFactory) {
			interceptionFactory = `${name}_interception_factory`
		}

		const returnTypeMatch = part.match(/\)\s*:\s*([^=]*?)\s*=>/)
		const returnType = returnTypeMatch[1].replace(/^\s*|\s*$/g, '').replace(/\n/g, ' ')
		const promise = /\nconst \w+ = async /.test(part)
		const fileAccess = /\bfs\./.test(part)
		const vscodeAccess = /\bvscode\./.test(part)
		let acc = []
		if (promise) {
			acc.push('async')
		}
		if (fileAccess) {
			acc.push('file access')
		}
		if (vscodeAccess) {
			acc.push('vscode access')
		}
		if (nameMatch) {
			return { name, part, returnType, acc, promise, fileAccess, vscode, defaultInterception, interceptionFactory }
		}
	})
	partsObj.sort((a, b) => a.name.localeCompare(b.name))
	const partsEnd = partsObj.map(p => p.part)
	const partsName = partsObj.map(p => {
		let n = p.name
		// if (p.acc.length > 0) {
		// 	n += `/* ${p.acc.join(', ')} */`
		// }
		return n
	})
	const _exports = `

/**
 * export methods
 */
const vsc /* IVscBase */ = {
	${partsName.join(',\n\t')}
}
export default vsc

`
	const newSource = first + '\n/**\n' + partsEnd.join('\n/**\n') + _exports
	return newSource
}

const saveFileContent = async (path: string, content: string) => await fs.writeFile(path, content)
const getFileContent = async (path: string) => await fs.readFile(path, 'utf8')
const isDir = (path: string) => fs.statSync(path).isDirectory()
const showMessage = (message: string) => vscode.window.showInformationMessage(message)
const showErrorMessage = (message: string) => vscode.window.showErrorMessage(message)
