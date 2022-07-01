import * as vscode from 'vscode';
import UNUSED_LABELS_TYPES from './unusedLabelsTypes';

export default function checkForUnusedLabels(doc: vscode.TextDocument) : any {
    const fileText: string = doc.getText();
    const varsInFile: string[] | null = getVarsInFile(fileText);

    let labelsWithOccurrences: any = buildLabelsWithOccurrences();

    varsInFile?.forEach(v => {
        labelsWithOccurrences.variables[v] = getOccurrencesOfVariable(v, fileText);

        // console.log("occurrences of " + v + ":");
        // console.log(getOccurrencesOfVariable(v, fileText));
    });

    return labelsWithOccurrences;
}

function buildLabelsWithOccurrences() : any {
    let labelsWithOccurrences: any = {};
    Object.keys(UNUSED_LABELS_TYPES).forEach(t => {
        labelsWithOccurrences[t] = {};
    });
    return labelsWithOccurrences;
}

function getVarsInFile(fileText: string) : string[] | null {
    const variableRegex: RegExp = /(?<=\s+(var|let|const)\s+)(\w+)/g;
    return fileText.match(variableRegex);
}

function getOccurrencesOfVariable(varName: string, fileText: string) : number {
    let occurrences: number | undefined = 0;

    const variableRegex: RegExp = new RegExp(`\\W${varName}\\W`, 'g');
    occurrences = fileText.match(variableRegex)?.length;

    return occurrences ? occurrences : 0;
}