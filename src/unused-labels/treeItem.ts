import * as vscode from "vscode";

export class UnusedLabelsTreeItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public collapsibleState: vscode.TreeItemCollapsibleState,
		public type: string,
		public parentId: string
	) {
		super(label, collapsibleState);
		this.type = type;
		this.parentId = parentId;
		this.occurrences = 1;
		this.command = {
			command: "unusedLabels.goToLabel",
			title: "Go to label",
			arguments: [this.label]
		}
	}
	private occurrences: number;

	public incrementOccurrence() {
		this.occurrences++;
	}

	public getOccurrences(): number {
		return this.occurrences;
	}
};