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

	handleOnFileChange();
	registerEvents();
}

function initFileLabelsData() {
	fileLabelsData = new FileLabelsData();
}

function registerEvents() {
	// vscode.workspace.onDidSaveTextDocument(updateUnusedLabelsData);
	vscode.workspace.onDidChangeTextDocument(updateUnusedLabelsData);
	vscode.window.onDidChangeActiveTextEditor(handleOnFileChange);
}

function updateUnusedLabelsData() {
	if (vscode.window.activeTextEditor) {
		// console.log(vscode.window.activeTextEditor.document.fileName);
		// console.log(vscode.window.activeTextEditor.document.languageId);
		fileLabelsData.updateData(checkForUnusedLabels(vscode.window.activeTextEditor.document));
		fileLabelsData.refresh();
	}
}

function handleOnFileChange(): void {
	if (checkIfFileIsVue()) {
		updateUnusedLabelsData();
	}
	else {
		fileLabelsData.clearData();
		fileLabelsData.refresh();
	}
}

function checkIfFileIsVue(): Boolean {
	return vscode.window.activeTextEditor?.document.languageId === 'vue';
}

export function deactivate() {}