# vsc-move

(vsc Extasion)

Fix problems with moving files in vscode.

vsc-move take control of all imports.

Forces import paths to be absolute from rootPath except files/folders in same folder or subfolder.
import ref to file in the same folder and subfolders will start './'
All other ref will be from rootPath and will have no prefix (Not even '/')

> vsc-move will update EVERY FILE under the definde rootPath (normally '/src')

So if that is not what you want, then dont use this extansion!

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
		"baseUrl": "/src",
	}
}
```

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


## Know issues

1. Not working on unix/linus systems!!! (I believe)

This is due to '/' vs '\\', and can be fix in the future!

2. Absolute path has no prefix

Some project works with absolute path prefix like '@'.
This can also be fix in future version.

3. './' relative paths settings missing.

All path to file in the same folder or sub folder will get relative path starting with './'
Its not all project that will use that convention.
In the future this could maybe to set in a config property

4. No intelligence for tsconfig paths.

vsc-move dont scan tsconfig files, and it dont know anything about other kins of path manipulation.


## Related Projects

> vsc-scaffolding [https://github.com/alfnielsen/vsc-scaffolding]

> vsc-script [https://github.com/alfnielsen/vsc-script]
