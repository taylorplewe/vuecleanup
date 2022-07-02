import * as vscode from 'vscode';
import UNUSED_LABELS_TYPES from './unusedLabelsTypes';

export default function checkForUnusedLabels(doc: vscode.TextDocument) : any {
    const fileText: string = doc.getText();
    const varsInFile: Set<string> = getVarsInFile(fileText);
    const cssClassesInFile: Set<string> = getCssClassesInFile(fileText);
    console.log(cssClassesInFile);

    let labelsWithOccurrences: any = buildLabelsWithOccurrences();

    varsInFile.forEach(v => {
        labelsWithOccurrences.variables[v] = getOccurrencesOfVariable(fileText, v);
    });
    cssClassesInFile.forEach(c => {
        console.log("occurrences of: " + c + ":");
        console.log(getOccurrencesOfCssClasses(fileText, c));
        labelsWithOccurrences.cssClasses[c] = getOccurrencesOfCssClasses(fileText, c);
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

function getVarsInFile(fileText: string) : Set<string> {
    const variableRegex: RegExp = /(?<=\s+(var|let|const)\s+)(\w+)/g;
    const variables = fileText.match(variableRegex);
    return new Set(variables);
}

function getOccurrencesOfVariable(fileText: string, varName: string) : number {
    let occurrences: number | undefined = 0;

    const variableRegex: RegExp = new RegExp(`\\W${varName}\\W`, 'g');
    occurrences = fileText.match(variableRegex)?.length;

    return occurrences ? occurrences : 0;
}

function getCssClassesInFile(fileText: string) : Set<string> {
    const fileStyleSection = getFileSectionByType(fileText, 'style');
    const searchCssClassesRegex = /\B\.[\w\-_]+/g;
    const cssClasses = fileStyleSection.match(searchCssClassesRegex);
    return new Set(cssClasses);
}

function getOccurrencesOfCssClasses(fileText: string, className: string) : number {
    return 1;
}

function getFileSectionByType(fileText: string, type: string) : string {
    const getSectionRegex: RegExp = new RegExp(
        `(?:<\\s*?${type}[\\s\\S]*?>)([\\s\\S]*?)(?=<\\/\\s*${type})`
    );
    const sectionMatch = fileText.match(getSectionRegex);
    return sectionMatch ? sectionMatch[1] : '';
}