import * as vscode from "vscode";
import { TodosTreeItem } from "./todosTreeItem";

export class TodosDataProvider implements vscode.TreeDataProvider<TodosTreeItem> {
    constructor() {
        this.todos = [];
    }
    getTreeItem(element: TodosTreeItem): TodosTreeItem | Thenable<TodosTreeItem> {
        return element;
    }
    getChildren(element?: TodosTreeItem | undefined): TodosTreeItem[] {
        if (!element)
            return this.todos;
        else return [];
    }

	private todos: TodosTreeItem[];

	private _onDidChangeTreeData: vscode.EventEmitter<TodosTreeItem | undefined | null | void> = new vscode.EventEmitter<TodosTreeItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<TodosTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    updateData(data: string[]): void {
        this.clearData();
        data.forEach(s => {
            this.todos.push(new TodosTreeItem(
                s,
                vscode.TreeItemCollapsibleState.None
            ));
        });
    }

    clearData(): void {
        this.todos = [];
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

}