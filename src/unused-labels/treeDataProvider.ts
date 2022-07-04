import * as vscode from "vscode";
import { UnusedLabelsTreeItem } from "./treeItem";
import UNUSED_LABELS_TYPES from './unusedLabelsTypes';

const TIME_BEFORE_REVEAL: number = 100;

export class FileLabelsData implements vscode.TreeDataProvider<UnusedLabelsTreeItem> {
	constructor() {
		this.unusedLabelsData = {};
		this.topLevelTreeItems = [];
		this.initData();
	}
	public unusedLabelsData: any;
	private topLevelTreeItems: UnusedLabelsTreeItem[];
	public parentTreeView: vscode.TreeView<UnusedLabelsTreeItem> | undefined;

	private _onDidChangeTreeData: vscode.EventEmitter<UnusedLabelsTreeItem | undefined | null | void> = new vscode.EventEmitter<UnusedLabelsTreeItem | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<UnusedLabelsTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

	getTreeItem(element: UnusedLabelsTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	getChildren(element?: UnusedLabelsTreeItem | undefined): UnusedLabelsTreeItem[] {
		if (!element) {
			return this.topLevelTreeItems;
		}
		else if (element.type !== "label" && Object.keys(this.unusedLabelsData[element.type].children).length) {
			return this.getFilteredChildrenArrayFromObj(this.unusedLabelsData[element.type].children);
		}
		else {
			return [];
		}
	}
	
	getParent(element: UnusedLabelsTreeItem): UnusedLabelsTreeItem | null {
		if (!element.parentId.length)
			return null;
		else {
			return this.unusedLabelsData[element.parentId].treeItem;
		}
	}

	private initData(): void {
		Object.keys(UNUSED_LABELS_TYPES).forEach(labelId => {
			this.unusedLabelsData[labelId] = {
				treeItem: new UnusedLabelsTreeItem(
					UNUSED_LABELS_TYPES[labelId],
					vscode.TreeItemCollapsibleState.Expanded,
					labelId,
					''
				),
				children: {}
			};
			this.topLevelTreeItems.push(this.unusedLabelsData[labelId].treeItem); 
		});
	}

	updateData(data: any): void {
		if (!this.topLevelTreeItems.length)
			this.initData();
		this.resetChildrenOfTopLevel();
		Object.keys(data).forEach(groupId => {
			Object.keys(data[groupId]).forEach(labelName => {
				this.unusedLabelsData[groupId].children[labelName] = 
					new UnusedLabelsTreeItem(
						labelName,
						vscode.TreeItemCollapsibleState.None,
						"label",
						groupId);
				for (let i: number = 0; i < data[groupId][labelName] - 1; i++)
					<UnusedLabelsTreeItem>this.unusedLabelsData[groupId].children[labelName].incrementOccurrence();
			});
			this.updateTopLevelExpandableState(groupId);
		});
		this.updateGroupCounts();
	}

	clearData(): void {
		this.unusedLabelsData = {};
		this.topLevelTreeItems = [];
	}

	private resetChildrenOfTopLevel(): void {
		Object.keys(UNUSED_LABELS_TYPES).forEach(labelId => {
			this.unusedLabelsData[labelId].children = {};
		});
	}

	private updateTopLevelExpandableState(type: string): void {
		if (this.getFilteredChildrenArrayFromObj(this.unusedLabelsData[type].children).length) {
			this.unusedLabelsData[type].treeItem.collapsibleState =
				vscode.TreeItemCollapsibleState.Expanded;
			this.revealAndExpandTreeItem(this.unusedLabelsData[type].treeItem);
		} else {
			this.unusedLabelsData[type].treeItem.collapsibleState =
				 vscode.TreeItemCollapsibleState.None;
		}
	}

	private revealAndExpandTreeItem(item: UnusedLabelsTreeItem): void {
		setTimeout(() => { this.parentTreeView?.reveal(item, {
			expand: true,
			select: false
		})}, TIME_BEFORE_REVEAL);
	}

	private updateGroupCounts(): void {
		Object.keys(UNUSED_LABELS_TYPES).forEach(labelId => {
			this.unusedLabelsData[labelId].treeItem.description = 
				this.getFilteredChildrenArrayFromObj(this.unusedLabelsData[labelId].children).length.toString();
		});
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	private getFilteredChildrenArrayFromObj(childrenObj: any): UnusedLabelsTreeItem[] {
		let stupidFaggotArray: UnusedLabelsTreeItem[] =
			Object.values(childrenObj);
		return stupidFaggotArray.filter(l => l.getOccurrences() === 1);
	}
}

