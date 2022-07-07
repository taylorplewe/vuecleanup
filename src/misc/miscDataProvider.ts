import * as vscode from "vscode";
import { MiscTreeItem } from "./miscTreeItem";

export class MiscDataProvider implements vscode.TreeDataProvider<MiscTreeItem> {
    constructor() {
        this.suggestions = [];
    }
    getTreeItem(element: MiscTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: MiscTreeItem | undefined): vscode.ProviderResult<MiscTreeItem[]> {
        if (!element)
            return this.suggestions;
        else return [];
    }

    suggestions: MiscTreeItem[];

    private _onDidChangeTreeData: vscode.EventEmitter<MiscTreeItem | undefined | null | void> = new vscode.EventEmitter<MiscTreeItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<MiscTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    updateData(data: any[]): void {
        this.clearData();
        data.forEach(obj => {
            this.suggestions.push(new MiscTreeItem(
                obj.label,
                vscode.TreeItemCollapsibleState.None,
                obj.line,
                obj.description
            ));
        });
    }

    clearData(): void {
        this.suggestions = [];
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}