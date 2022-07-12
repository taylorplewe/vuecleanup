import * as vscode from "vscode";

export class LeftoversTreeItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public collapsibleState: vscode.TreeItemCollapsibleState,
        public type: string,
		public description?: string,
	) {
		super(label, collapsibleState);
        this.command = {
            command: "vuecleanup.goToLabel",
            title: "Go to label",
            arguments: [this.label]
        }
        this.type = type;
		if (description) this.description = description;
	}
};