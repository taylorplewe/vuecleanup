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
		"treeDataProvider": fileLabelsData,
		"showCollapseAll": true
	});
	fileLabelsData.parentTreeView = unusedLabelsTreeView;

	vscode.window.registerTreeDataProvider("unused-labels", fileLabelsData);
	vscode.commands.registerCommand("unusedLabels.goToLabel", label => goToLabel(label));

	handleOnFileChange();
	registerEvents();
}

function initFileLabelsData() {
	fileLabelsData = new FileLabelsData();
}

function registerEvents() {
	// vscode.workspace.onDidSaveTextDocument(updateUnusedLabelsData);
	vscode.workspace.onDidChangeTextDocument(handleOnFileChange);
	vscode.window.onDidChangeActiveTextEditor(handleOnFileChange);
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

function updateUnusedLabelsData() {
	if (vscode.window.activeTextEditor) {
		fileLabelsData.updateData(checkForUnusedLabels(vscode.window.activeTextEditor.document));
		fileLabelsData.refresh();
	}
}

function checkIfFileIsVue(): Boolean {
	return vscode.window.activeTextEditor?.document.languageId === 'vue';
}

function goToLabel(label: string): void {
	let textEditor: vscode.TextEditor | undefined;
	if (textEditor = vscode.window.activeTextEditor) {
		const numFileLines: number = textEditor.document.lineCount;
		let line: number;
		let labelIndexInLine: number = 0;
		let found: boolean = false;
		for (line = 0; line < numFileLines; line++) {
			labelIndexInLine = textEditor.document.lineAt(line).text.indexOf(label);
			if (labelIndexInLine !== -1) {
				found = true;
				break;
			}
		}
		if (found) {
			const labelPosition: vscode.Position = new vscode.Position(line, labelIndexInLine);
			const labelEndPosition: vscode.Position = new vscode.Position(line, labelIndexInLine + label.length);
			textEditor.selection = new vscode.Selection(labelPosition, labelEndPosition);
			
			textEditor.revealRange(
				new vscode.Range(labelPosition, labelEndPosition),
				vscode.TextEditorRevealType.InCenter
			);
		}
	}
}

export function deactivate() {}