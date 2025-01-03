// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import type * as ts from "typescript";

const content = {
  message: "",
  displayText: "",
  documentation: "",
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "typespector" is now active!');

  // This command maps to the `contributes: { command }` property in package.json
  const openCommand = vscode.commands.registerCommand(
    "typespector.open",
    async () => {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      // vscode.window.showInformationMessage('Hello World from typespector!');

      // Get the active text editor
      const activeEditor = vscode.window.activeTextEditor;

      // First move the current editor to the lower group
      // This isn't ideal yet but works for prototyping
      if (activeEditor) {
        await vscode.commands.executeCommand(
          "workbench.action.moveEditorToBelowGroup"
        );
      }

      // Then create the webview panel in the top group
      const panel = vscode.window.createWebviewPanel(
        "typespector",
        "Typespector",
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
        }
      );

      // Focus back on the editor
      if (activeEditor) {
        // Set HTML content for the webview
        panel.webview.html = `
				<!DOCTYPE html>
				<html>
					<head>
						<meta charset="UTF-8">
						<title>Typespector</title>
					</head>
					<body>
						<h1>Typespector</h1>
						<div id="content">
							<p>${content.displayText ? content.displayText : ""}</p>

							<p>${content.documentation ? content.documentation : ""}</p>
						</div>
					</body>
				</html>
			`;

        // Show the editor in the second column
        // await vscode.window.showTextDocument(activeEditor.document, {
        // 	viewColumn: vscode.ViewColumn.Two,
        // 	preserveFocus: false
        // });
      }
    }
  );

  const getInfoCommand = vscode.commands.registerCommand(
    "typespector.getInfo",
    async () => {
      const { activeTextEditor } = vscode.window;

      if (!activeTextEditor) {
        return;
      }

      const { selection } = activeTextEditor;

      const request: ts.server.protocol.FileLocationRequestArgs = {
        file: activeTextEditor.document.fileName,
        line: selection.anchor.line + 1,
        offset: selection.anchor.character + 1,
      };

      console.log(
        "Typespector output:",
        activeTextEditor.document.getText(selection)
      );

      vscode.window.showInformationMessage(
        activeTextEditor.document.getText(selection)
      );

      const quickInfoResponse:
        | ts.server.protocol.QuickInfoResponse
        | undefined = await vscode.commands.executeCommand(
        "typescript.tsserverRequest",
        "quickinfo",
        request
      );

      // outputs the full line
      console.log(
        "Typespector response.body.displayString:",
        quickInfoResponse?.body?.displayString
      );

      if (quickInfoResponse?.body?.displayString) {
        content.displayText = quickInfoResponse?.body?.displayString;
      } else {
        content.displayText = "";
      }

      const documentation = quickInfoResponse?.body?.documentation;

      const text =
        typeof documentation === "string"
          ? documentation
          : documentation?.map((doc) => doc.text).join("");

      if (text) {
        content.documentation = text;
      } else {
        content.documentation = "";
      }

      console.log("Typespector response.body.documentation:", text);
    }
  );

  context.subscriptions.push(openCommand);
  context.subscriptions.push(getInfoCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
