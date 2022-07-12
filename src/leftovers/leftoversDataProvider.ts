import * as vscode from "vscode";
import { LeftoversTreeItem } from "./leftoversTreeItem";
import LEFTOVERS_TYPES from "./leftoversTypes";

export class LeftoversDataProvider implements vscode.TreeDataProvider<LeftoversTreeItem> {
    constructor() {
        this.leftoversData = {};
        this.topLevelTreeItems = [];
    }
    getTreeItem(element: LeftoversTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: LeftoversTreeItem | undefined): vscode.ProviderResult<LeftoversTreeItem[]> {
        if (!element)
            return this.topLevelTreeItems;
        else if (element.type !== 'child')
            return this.leftoversData[element.type];
        else return [];
    }

    leftoversData: any;
    private topLevelTreeItems: LeftoversTreeItem[];

    private _onDidChangeTreeData: vscode.EventEmitter<LeftoversTreeItem | undefined | null | void> = new vscode.EventEmitter<LeftoversTreeItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<LeftoversTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    updateData(data: any): void {
        this.clearData();
        Object.keys(data).forEach(type => {
            if (data[type].length) {
                this.topLevelTreeItems.push(new LeftoversTreeItem(
                    LEFTOVERS_TYPES[type],
                    vscode.TreeItemCollapsibleState.Expanded,
                    type
                ));
                this.leftoversData[type] = [];
                data[type].forEach((child: string) => {
                    this.leftoversData[type].push(new LeftoversTreeItem(
                        child,
                        vscode.TreeItemCollapsibleState.None,
                        'child'
                    ))
                });
            }
        })
    }

    clearData(): void {
        this.leftoversData = {};
        this.topLevelTreeItems = [];
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}