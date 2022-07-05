import * as vscode from "vscode";
import { TodosTreeItem } from "./todosTreeItem";

export class TodosDataProvider implements vscode.TreeDataProvider<TodosTreeItem> {
    constructor() {
        this.topLevelTreeItems = [];
    }
    getTreeItem(element: TodosTreeItem): TodosTreeItem | Thenable<TodosTreeItem> {
        return element;
    }
    getChildren(element?: TodosTreeItem | undefined): TodosTreeItem[] {
        if (!element)
            return this.topLevelTreeItems;
        else return [];
    }

	private topLevelTreeItems: TodosTreeItem[];

	private _onDidChangeTreeData: vscode.EventEmitter<TodosTreeItem | undefined | null | void> = new vscode.EventEmitter<TodosTreeItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<TodosTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;


    updateData(data: string[]): void {
        this.clearData();
        data.forEach(s => {
            this.topLevelTreeItems.push(new TodosTreeItem(
                s,
                vscode.TreeItemCollapsibleState.None
            ));
        });
    }

    clearData(): void {
        this.topLevelTreeItems = [];
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

}