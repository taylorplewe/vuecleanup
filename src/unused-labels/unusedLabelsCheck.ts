import * as vscode from 'vscode';

export default function CheckForUnusedLabels(doc: vscode.TextDocument): void {
    console.log(doc.lineAt(0));
}