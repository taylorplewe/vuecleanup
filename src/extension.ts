import * as vscode from 'vscode';

import { UnusedLabelsDataProvider } from './unused-labels/unusedLabelsDataProvider';
import getUnusedLabelData from './unused-labels/unusedLabelsUpdate';

import { MiscDataProvider } from './misc/miscDataProvider';
import getMiscData from './misc/miscUpdate';

import { CommentsDataProvider } from './comments/commentsDataProvider';
import getCommentsData from './comments/commentsUpdate';

import { TodosDataProvider } from './todos/todosDataProvider';
import getTodosData from './todos/todosUpdate';

let unusedLabelsDataProvider: UnusedLabelsDataProvider;
let miscDataProvider: MiscDataProvider;
let commentsDataProvider: CommentsDataProvider;
let todosDataProvider: TodosDataProvider;
let currentFile: vscode.TextDocument | null;

export function activate(context: vscode.ExtensionContext) {
	init();
	handleOnFileChange();
	registerEvents();
}

function init() {
	console.log('Vue Cleanup extension active');
	vscode.commands.registerCommand("vuecleanup.goToLabel", label => goToLabel(label));

	unusedLabelsDataProvider = new UnusedLabelsDataProvider();
	vscode.window.createTreeView("vuecleanup.unused-labels", {
		"treeDataProvider": unusedLabelsDataProvider
	});
	vscode.window.registerTreeDataProvider("vuecleanup.unused-labels", unusedLabelsDataProvider);

	miscDataProvider = new MiscDataProvider();
	vscode.window.createTreeView("vuecleanup.misc", {
		"treeDataProvider": miscDataProvider
	});
	vscode.window.registerTreeDataProvider("vuecleanup.misc", miscDataProvider);

	commentsDataProvider = new CommentsDataProvider();
	vscode.window.createTreeView("vuecleanup.comments", {
		"treeDataProvider": commentsDataProvider
	});
	vscode.window.registerTreeDataProvider("vuecleanup.comments", commentsDataProvider);

	todosDataProvider = new TodosDataProvider();
	vscode.window.createTreeView("vuecleanup.todos", {
		"treeDataProvider": todosDataProvider
	});
	vscode.window.registerTreeDataProvider("vuecleanup.todos", todosDataProvider);

	// commentsDataProvider = new CommentsData
}

function registerEvents() {
	// vscode.workspace.onDidSaveTextDocument(updateUnusedLabelsData);
	vscode.workspace.onDidChangeTextDocument(handleOnFileChange);
	vscode.window.onDidChangeActiveTextEditor(handleOnFileChange);
}

function handleOnFileChange(): void {
	currentFile = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document : null;
	if (currentFile && checkIfFileIsVue()) {
		updateUnusedLabelsData();
		updateMiscData();
		updateTodosData();
		updateCommentsData();
	}
	else {
		unusedLabelsDataProvider.clearData();
		unusedLabelsDataProvider.refresh();
	}
}

function updateUnusedLabelsData(): void {
	if (currentFile) {
		unusedLabelsDataProvider.updateData(getUnusedLabelData(currentFile));
		unusedLabelsDataProvider.refresh();
	}
}

function updateMiscData(): void {
	if (currentFile) {
		miscDataProvider.updateData(getMiscData(currentFile.getText()));
		miscDataProvider.refresh();
	}
}

function updateTodosData(): void {
	if (currentFile) {
		todosDataProvider.updateData(getTodosData(currentFile.getText()));
		todosDataProvider.refresh();
	}
}

function updateCommentsData(): void {
	if (currentFile) {
		commentsDataProvider.updateData(getCommentsData(currentFile.getText()));
		commentsDataProvider.refresh();
	}
}

function checkIfFileIsVue(): Boolean {
	return currentFile?.languageId === 'vue';
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