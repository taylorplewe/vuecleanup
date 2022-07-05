import * as vscode from "vscode";
import { CommentsTreeItem } from "./commentsTreeItem";

export class CommentsDataProvider implements vscode.TreeDataProvider<CommentsTreeItem> {
    constructor() {

    }
    getTreeItem(element: CommentsTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: CommentsTreeItem | undefined): vscode.ProviderResult<CommentsTreeItem[]> {
        return [];
    }
}