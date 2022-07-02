// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { join } from 'path';
import * as vscode from 'vscode';
import { FileLabelsData } from './unused-labels/treeDataProvider';
import { UnusedLabelsTreeItem } from './unused-labels/treeItem';
import checkForUnusedLabels from './unused-labels/unusedLabelsCheck';

let fileLabelsData : FileLabelsData;
let unusedLabelsTreeView : vscode.TreeView<UnusedLabelsTreeItem>;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Vue Cleanup extension active');

	initFileLabelsData();

	unusedLabelsTreeView = vscode.window.createTreeView("unused-labels", {
		treeDataProvider: fileLabelsData
	});

	vscode.window.registerTreeDataProvider("unused-labels", fileLabelsData);
	
	updateUnusedLabelsData();
	registerEvents();
}

function initFileLabelsData() {
	fileLabelsData = new FileLabelsData();
}

function registerEvents() {
	vscode.workspace.onDidSaveTextDocument(updateUnusedLabelsData);
	vscode.window.onDidChangeActiveTextEditor(updateUnusedLabelsData);
}

function updateUnusedLabelsData() {
	if (vscode.window.activeTextEditor) {
		fileLabelsData.updateData(checkForUnusedLabels(vscode.window.activeTextEditor.document));
		fileLabelsData.refresh();
	}
}

export function deactivate() {}