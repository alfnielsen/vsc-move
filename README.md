# vsc-move

(vscode Extesion)

Fix problems with moving files in vscode.

vsc-move take control of all imports.

Forces import paths to be absolute from rootPath except files/folders in same folder or subfolder.
import ref to file in the same folder and subfolders will start './'
All other ref will be from rootPath and will have no prefix (Not even '/')

> vsc-move will update EVERY FILE under the definde rootPath (normally '/src')

So if that is not what you want, then dont use this extension!

## Usage

1. Right a folder or file
2. Click 'vsc Move'
3. Write new location and press enter

## Project Absolute path

You need to set absolute path in your project.

For **javascript** projects:

> jsconfig.json

```
{
  "compilerOptions": {
    ...
    "baseUrl": "/src",
  }
}
```

For **typescript** projects:

> tsconfig.json

```
{
   "compilerOptions": {
      ...
      "baseUrl": "./src/",
   }
}
```
> If you use **typescript** and **create-react-app** you need to move 'baseUrl' out in its own file and extend from it in tsconfig.json See [discussion on create-react-app's github](https://github.com/facebook/create-react-app/issues/5645)

For **create-react-app** projects:

> .env

```
NODE_PATH=/src
```

## Configuration

**rootPath**

Default value is '/src'

**filesToHandle**

Comma seperated list of file extansions that vsc-move will handle.
vsc-move will update all import in these files.

Default value is 'css,scss,ts,tsx,js,jsx'

**excludePattern**

vscMove will ignore all import paths that matches this excludePattern.

If the project has files that uses imports from outside the rootPath,
vscMove will update the import to full system parth.

To avoid this you can add the excludePattern.

EX:
If you use storybook library and have your stories inside the the rootPath but need to import configs from outside the rootPath,
you can exclude this with an regexp like this: ^.\*\\/\\.storybook\\/ (This will ignore all import includes '/.storybook/' )

## Know issues

1. Absolute path has no prefix

Some project works with absolute path prefix like '@'.
This can also be fix in future version.

2. './' relative paths settings missing.

All path to file in the same folder or sub folder will get relative path starting with './'
Its not all project that will use that convention.
In the future this could maybe to set in a config property

3. No intelligence for tsconfig paths.

vsc-move dont scan tsconfig files, and it dont know anything about other kins of path manipulation.

## Links and related projects

> vsc-script [vscode-extension](https://marketplace.visualstudio.com/items?itemName=alfnielsen.vsc-script) | [source-code](https://github.com/alfnielsen/vsc-script)

> vsc-base: [npm-module](https://www.npmjs.com/package/vsc-base) | [source-code](https://github.com/alfnielsen/vsc-base)

> vsc-base.org: [documentation](http://vsc-base.org) | [source-code](https://github.com/alfnielsen/vsc-base.org)

> vsc-scaffolding: [vscode-extension](https://marketplace.visualstudio.com/items?itemName=alfnielsen.vsc-scafolding) | [source-code](https://github.com/alfnielsen/vsc-scaffolding)

> vsc-move: [vscode-extension](https://marketplace.visualstudio.com/items?itemName=alfnielsen.vsc-move) | [source-code](https://github.com/alfnielsen/vsc-move)
