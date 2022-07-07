import * as vscode from "vscode";

export class MiscTreeItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public collapsibleState: vscode.TreeItemCollapsibleState,
		public line: string,
		public description?: string
	) {
		super(label, collapsibleState);
		this.line = line;
		this.command = {
            command: "vuecleanup.goToLabel",
            title: "Go to label",
            arguments: [this.line]
        }
		if (description) this.description = description;
	}
};