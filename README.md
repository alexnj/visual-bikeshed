# Visual Bikeshed

<img src="https://raw.githubusercontent.com/alexnj/visual-bikeshed/main/visual-bikeshed.svg" width=100 height=100 align=left>

Visual Studio Code extension for [Bikeshed](https://github.com/speced/bikeshed) that strives to provide a better and integrated authoring experience for spec authors.

This plugin is currently in Beta and under active development. There may be bugs. Please file an issue. Pull requests are always welcome!

## Features

- Bikeshed side-by-side preview within Visual Studio Code.
- Compilation support via [local Bikeshed install](https://speced.github.io/bikeshed/#installing) or through [a remote CGI](https://api.csswg.org/bikeshed/).
- IntelliSense / autocompletion support for W3C webref definitions and definitions within the document.

## Requirements

- Local Bikeshed installation if you want faster and local compilation (preferred method). Follow [ Bikeshed installation steps](https://speced.github.io/bikeshed/#installing).

## Extension Settings

This extension contributes the following settings:

- `visualBikeshed.autoUpdate`: Automatically update the preview when the document changes.
- `visualBikeshed.compilerOption`: Selects a compilation method (URL or Bikeshed binary path).
- `visualBikeshed.commandPath`: Path to the Bikeshed binary, for local compilation.
- `visualBikeshed.processorUrl`: URL of the Bikeshed processor (defaults to `https://api.csswg.org/bikeshed/`).

## Known Issues

- W3C WebRef index is a work in progress.

## Release Notes

### 0.0.1

Initial release of Visual Bikeshed.

## For more information

- [Bikeshed Documentation](https://speced.github.io/bikeshed)
- [WebRef repository](https://github.com/w3c/webref)

**Enjoy!**
