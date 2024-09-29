# Visual Bikeshed

<img src="https://github.com/user-attachments/assets/98224412-08da-4b9a-8c29-4d6f467e780f" width=150 height=150 align=left>

Visual Studio Code extension for [Bikeshed](https://github.com/speced/bikeshed) that strives to provide a better and integrated authoring experience for spec authors, including a side-by-side preview and language features like autocompletion.

This plugin is currently in Beta and under active development. There may be bugs. Please file an issue. Pull requests are always welcome!

## Features

- Bikeshed side-by-side preview within Visual Studio Code. Bring up Visual Studio Code [Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) (⇧⌘P on Macs) and select `Open Bikeshed Preview` while editing a Bikeshed file.
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

### 0.0.1 - 0.0.2

Initial releases of Visual Bikeshed.

## For more information

- [Bikeshed Documentation](https://speced.github.io/bikeshed)
- [WebRef repository](https://github.com/w3c/webref)
