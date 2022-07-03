import * as vscode from 'vscode';
import { FileLabelsData } from './unused-labels/treeDataProvider';
import { UnusedLabelsTreeItem } from './unused-labels/treeItem';
import checkForUnusedLabels from './unused-labels/unusedLabelsCheck';

let fileLabelsData: FileLabelsData;
let unusedLabelsTreeView: vscode.TreeView<UnusedLabelsTreeItem>;

export function activate(context: vscode.ExtensionContext) {
	console.log('Vue Cleanup extension active');

	initFileLabelsData();

	unusedLabelsTreeView = vscode.window.createTreeView("unused-labels", {
		treeDataProvider: fileLabelsData
	});
	fileLabelsData.parentTreeView = unusedLabelsTreeView;

	vscode.window.registerTreeDataProvider("unused-labels", fileLabelsData);

	updateUnusedLabelsData();
	registerEvents();
}

function initFileLabelsData() {
	fileLabelsData = new FileLabelsData();
}

function registerEvents() {
	// vscode.workspace.onDidSaveTextDocument(updateUnusedLabelsData);
	vscode.workspace.onDidChangeTextDocument(updateUnusedLabelsData);
	vscode.window.onDidChangeActiveTextEditor(updateUnusedLabelsData);
}

function updateUnusedLabelsData() {
	if (vscode.window.activeTextEditor) {
		// console.log(vscode.window.activeTextEditor.document.fileName);
		// console.log(vscode.window.activeTextEditor.document.languageId);
		fileLabelsData.updateData(checkForUnusedLabels(vscode.window.activeTextEditor.document));
		fileLabelsData.refresh();
	}
}

export function deactivate() {}