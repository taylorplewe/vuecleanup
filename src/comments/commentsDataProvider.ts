import * as vscode from "vscode";
import { CommentsTreeItem } from "./commentsTreeItem";

export class CommentsDataProvider implements vscode.TreeDataProvider<CommentsTreeItem> {
    constructor() {
        this.comments = [];
    }
    getTreeItem(element: CommentsTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: CommentsTreeItem | undefined): vscode.ProviderResult<CommentsTreeItem[]> {
        if (!element)
            return this.comments;
        else return [];
    }

    comments: CommentsTreeItem[];

    private _onDidChangeTreeData: vscode.EventEmitter<CommentsTreeItem | undefined | null | void> = new vscode.EventEmitter<CommentsTreeItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<CommentsTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    updateData(data: string[]): void {
        this.clearData();
        data.forEach(c => {
            this.comments.push(new CommentsTreeItem(
                c,
                vscode.TreeItemCollapsibleState.None
            ));
        });
    }

    clearData(): void {
        this.comments = [];
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}