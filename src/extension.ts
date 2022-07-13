import * as vscode from 'vscode';

import { UnusedLabelsDataProvider } from './unused-labels/unusedLabelsDataProvider';
import getUnusedLabelData from './unused-labels/unusedLabelsUpdate';

import { MiscDataProvider } from './misc/miscDataProvider';
import getMiscData from './misc/miscUpdate';

import { LeftoversDataProvider } from './leftovers/leftoversDataProvider';
import getLeftoversData from './leftovers/leftoversUpdate';

let unusedLabelsDataProvider: UnusedLabelsDataProvider;
let miscDataProvider: MiscDataProvider;
let leftoversDataProvider: LeftoversDataProvider;
let currentFile: vscode.TextDocument | null;

let docObj: any;

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

	leftoversDataProvider = new LeftoversDataProvider();
	vscode.window.createTreeView("vuecleanup.leftovers", {
		"treeDataProvider": leftoversDataProvider
	});
	vscode.window.registerTreeDataProvider("vuecleanup.leftovers", leftoversDataProvider);
}

function registerEvents() {
	// vscode.workspace.onDidSaveTextDocument(updateUnusedLabelsData);
	vscode.workspace.onWillSaveTextDocument(handleOnFileChange);
	vscode.window.onDidChangeActiveTextEditor(handleOnFileChange);
}

function handleOnFileChange(): void {
	currentFile = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document : null;
	if (currentFile && checkIfFileIsVue()) {
		updateSections();
		updateUnusedLabelsData();
		updateMiscData();
		udpateLeftoversData();
	}
	else {
		clearAll();
	}
}

function updateSections(): void {
	if (currentFile) {
		const allTextNoComments = removeCommentsFromText(currentFile.getText());
		docObj = {
			all: allTextNoComments,
			allWithComments: currentFile.getText(),
			template: getFileSectionByType(allTextNoComments, 'template', false),
			script: getFileSectionByType(allTextNoComments, 'script', true),
			scriptWithDoubleQuotes: getFileSectionByType(allTextNoComments, 'script', true, true),
			style: getFileSectionByType(allTextNoComments, 'style', false)
		}
	}
}

function clearAll(): void {
	unusedLabelsDataProvider.clearData();
	miscDataProvider.clearData();
	leftoversDataProvider.clearData();
	unusedLabelsDataProvider.refresh();
	miscDataProvider.refresh();
	leftoversDataProvider.refresh();
}

function updateUnusedLabelsData(): void {
	if (currentFile) {
		unusedLabelsDataProvider.updateData(getUnusedLabelData(docObj));
		unusedLabelsDataProvider.refresh();
	}
}

function updateMiscData(): void {
	if (currentFile) {
		miscDataProvider.updateData(getMiscData(docObj));
		miscDataProvider.refresh();
	}
}

function udpateLeftoversData(): void {
	if (currentFile) {
		leftoversDataProvider.updateData(getLeftoversData(currentFile.getText()));
		leftoversDataProvider.refresh();
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

function removeCommentsFromText(text: string): string {
	const searchCommentRegex: RegExp = /\/\/[^\n]*|\/\*.*?\*\//gs;
	return text.replace(searchCommentRegex, '');
}

function getFileSectionByType(fileText: string, type: string, removeStrings: boolean, excludeDoubleQuotes: boolean = false): string {
	const firstWhitespaceRegex: RegExp = new RegExp(
		`^[^\\n\\w]*?(?=<\\s*?${type})`, 'm'
	);
	const firstWhitespaceMatch = fileText.match(firstWhitespaceRegex);
	const numLines = firstWhitespaceMatch ? firstWhitespaceMatch.input?.substring(0, firstWhitespaceMatch.index).match(/\n/gs)?.length : 0;
	const firstWhitespace = firstWhitespaceMatch ? firstWhitespaceMatch[0] : '';
	const getSectionRegex: RegExp = new RegExp(
		`(?:<\\s*?${type}.*?>)(.*)(?=^${firstWhitespace}<\\/\\s*${type})`, 'sm'
	);
	const sectionMatch = fileText.match(getSectionRegex);
	if (removeStrings && sectionMatch)
		return removeStringsFromText(sectionMatch[1], excludeDoubleQuotes)
	else if (sectionMatch)
		return sectionMatch[1];
	else return '';
}

function removeStringsFromText(text: string, excludeDoubleQuotes: boolean = false): string {
	const searchStringRegex: RegExp = excludeDoubleQuotes
		? /'.*?'|`.*?`/gs
		: /".*?"|'.*?'|`.*?`/gs;
	let noStringsText = text;
	noStringsText += formatEscapesForStringAppend(
		extractFormattedStringEscapesInText(noStringsText)
	);
	noStringsText = noStringsText.replace(searchStringRegex, '');
	return noStringsText;
}

function extractFormattedStringEscapesInText(text: string): string[] {
	const searchFormattedStringsRegex: RegExp = /`.*?`/gs;
	const searchEscapesRegex: RegExp = /(?<=\$\{).*?(?=\})/gs;

	let escapes: string[] = [];
	const formattedStringsMatch: string[] | null = text.match(searchFormattedStringsRegex);
	formattedStringsMatch?.forEach(s => {
		const escapesMatch: string[] | null = s.match(searchEscapesRegex);
		if (escapesMatch) {
			escapes.push(...(escapesMatch as string[]));
		}
	});
	return escapes;
}

function formatEscapesForStringAppend(escapes: string[]): string {
	let formattedEscapesString = '\n';
	return escapes.reduce((prevString, currString) => {
		return prevString + currString + '\n';
	}, formattedEscapesString);
}

export function deactivate() {}