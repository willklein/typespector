// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "typespector" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('typespector.open', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello World from typespector!');
		// Get the active text editor
		const activeEditor = vscode.window.activeTextEditor;

		// First move the current editor to the lower group
		if (activeEditor) {
			await vscode.commands.executeCommand('workbench.action.moveEditorToBelowGroup');
		}

		// Then create the webview panel in the top group
		const panel = vscode.window.createWebviewPanel(
			'typespector',
			'Typespector',
			vscode.ViewColumn.One,
			{
				enableScripts: true
			}
		);

		// Focus back on the editor
		if (activeEditor) {
			await vscode.window.showTextDocument(activeEditor.document, {
				viewColumn: vscode.ViewColumn.Two,
				preserveFocus: false
			});
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
