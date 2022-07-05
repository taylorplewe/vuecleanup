import * as vscode from "vscode";

export class TodosTreeItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public collapsibleState: vscode.TreeItemCollapsibleState,
		public description?: string
	) {
		super(label, collapsibleState);
        this.command = {
            command: "vuecleanup.goToLabel",
            title: "Go to label",
            arguments: [this.label]
        }
		if (description) this.description = description;
	}
};