import * as vscode from "vscode";

export class UnusedLabelsTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label : string,
        public readonly collapsibleState : vscode.TreeItemCollapsibleState,
        public type : string
    ) {
        super(label, collapsibleState);
        this.type = type;
        this.occurrences = 1;
    }
    private occurrences: number;

    public incrementOccurrence() {
        this.occurrences++;
    }

    public getOccurrences(): number {
        return this.occurrences;
    }
};