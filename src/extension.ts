// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { join } from 'path';
import * as vscode from 'vscode';
import { FileLabelsData } from './unused-labels/treeDataProvider';
import CheckForUnusedLabels from './unused-labels/unusedLabelsCheck';

let fileLabelsData : FileLabelsData;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	initFileLabelsData();
	fileLabelsData.fillWithDummyData();
	fileLabelsData.updateGroupCounts();

	vscode.window.createTreeView("unused-labels", {
		treeDataProvider: fileLabelsData
	});
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Vue Cleanup extension active');


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vuecleanup.unusedlabels', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('You done clicked it boi');
		console.log(vscode.window.activeTextEditor);
		if (vscode.window.activeTextEditor)
			CheckForUnusedLabels(vscode.window.activeTextEditor.document);
	});

	context.subscriptions.push(disposable);
}

function initFileLabelsData() {
	fileLabelsData = new FileLabelsData();
}

// this method is called when your extension is deactivated
export function deactivate() {}
