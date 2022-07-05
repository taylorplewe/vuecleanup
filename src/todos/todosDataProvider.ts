import * as vscode from "vscode";
import { TodosTreeItem } from "./todosTreeItem";

export class TodosDataProvider implements vscode.TreeDataProvider<TodosTreeItem> {
    constructor() {

    }
    getTreeItem(element: TodosTreeItem): TodosTreeItem | Thenable<TodosTreeItem> {
        return element;
    }
    getChildren(element?: TodosTreeItem | undefined): TodosTreeItem[] {
        return [];
    }
}