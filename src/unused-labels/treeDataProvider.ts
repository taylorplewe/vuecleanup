import * as vscode from "vscode";
import { UnusedLabelsTreeItem } from "./treeItem";

const UNUSED_LABELS_ID_NAME: any = {
    dataMembers: "data members",
    computeds: "computed properties",
    methods: "methods",
    cssClasses: "CSS classes"
};

const DUMMY_DATA: any = {
    dataMembers: {
        "isModalOpen": 6,
        "isKyleDead": 1,
        "taxable": 1,
        "currentCostCenter": 2,
        "maryIsAlive": 4
    },
    computeds: {
        "filteredMetadata": 1,
        "filteredObjects": 4,
        "filteredHealthyes": 5
    },
    methods: {
        "prove()": 2,
        "examine()": 1,
        "tryThis()": 1
    },
    cssClasses: {
        ".bold": 4,
        ".mystrong": 1,
        ".labels": 4,
        ".inputs": 2,
        ".not-input": 1,
        ".not-letter": 1
    }
};

export class FileLabelsData implements vscode.TreeDataProvider<UnusedLabelsTreeItem> {
    constructor() {
        this.unusedLabelsData = {};
        Object.keys(UNUSED_LABELS_ID_NAME).forEach(labelId => {
            this.unusedLabelsData[labelId] = {
                treeItem: new UnusedLabelsTreeItem(
                    UNUSED_LABELS_ID_NAME[labelId],
                    vscode.TreeItemCollapsibleState.Collapsed,
                    labelId
                ),
                children: {}
            };
        });
    }
    public unusedLabelsData: any;

    getTreeItem(element : UnusedLabelsTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(
        element?: UnusedLabelsTreeItem | undefined
    ): vscode.ProviderResult<UnusedLabelsTreeItem[]> {
        if (!element) {
            return Promise.resolve(this.getGroupTreeItems());
        }
        else if (element.type !== "label" && Object.keys(this.unusedLabelsData[element.type].children).length) {
            return Promise.resolve(this.getChildrenArrays(this.unusedLabelsData[element.type].children));
        }
        else
            return Promise.resolve([]);
    }

    public updateGroupCounts() : void {
        Object.keys(UNUSED_LABELS_ID_NAME).forEach(labelId => {
            this.unusedLabelsData[labelId].treeItem.description = 
                this.getChildrenArrays(this.unusedLabelsData[labelId].children).length.toString();
        });
    }

    private getChildrenArrays(childrenObj: any) : UnusedLabelsTreeItem[] {
        let stupidFaggotArray: UnusedLabelsTreeItem[] =
            Object.values(childrenObj);
        return stupidFaggotArray.filter(l => l.getOccurrences() === 1);
    }

    private getGroupTreeItems() : UnusedLabelsTreeItem[] {
        let treeItemArray: UnusedLabelsTreeItem[] = [];
        Object.keys(UNUSED_LABELS_ID_NAME).forEach(labelId => {
            treeItemArray.push(this.unusedLabelsData[labelId].treeItem);
        });
        return treeItemArray;
    }

    public fillWithDummyData() : void {
        Object.keys(DUMMY_DATA).forEach(groupId => {
            Object.keys(DUMMY_DATA[groupId]).forEach(labelName => {
                this.unusedLabelsData[groupId].children[labelName] = 
                    new UnusedLabelsTreeItem(
                        labelName,
                        vscode.TreeItemCollapsibleState.None,
                        "label")
                ;
                for (let i: number = 0; i < DUMMY_DATA[groupId][labelName] - 1; i++)
                    <UnusedLabelsTreeItem>this.unusedLabelsData[groupId].children[labelName].incrementOccurrence();
            });
        });
    }
}