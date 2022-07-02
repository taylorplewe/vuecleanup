import { join } from 'path';
import * as vscode from 'vscode';
import UNUSED_LABELS_TYPES from './unusedLabelsTypes';

export default function checkForUnusedLabels(doc: vscode.TextDocument): any {
    const fileText: string = doc.getText();
    const varsInFile: Set<string> = getVarsInFile(fileText);
    const cssClassesInFile: Set<string> = getCssClassesInFile(fileText);

    let labelsWithOccurrences: any = buildLabelsWithOccurrences();

    const scriptSectionNoCommentsOrStrings = getScriptSectionNoCommentsOrStrings(fileText);
    console.log(scriptSectionNoCommentsOrStrings);
    varsInFile.forEach(v => {
        labelsWithOccurrences.variables[v] =
            getOccurrencesOfVariable(scriptSectionNoCommentsOrStrings, v);
    });
    cssClassesInFile.forEach(c => {
        labelsWithOccurrences.cssClasses[c] = getOccurrencesOfCssClasses(fileText, c);
    });

    return labelsWithOccurrences;
}

function buildLabelsWithOccurrences(): any {
    let labelsWithOccurrences: any = {};
    Object.keys(UNUSED_LABELS_TYPES).forEach(t => {
        labelsWithOccurrences[t] = {}; 
    });
    return labelsWithOccurrences;
}

function getVarsInFile(fileText: string): Set<string> {
    const variableRegex: RegExp = /(?<=\s+(var|let|const)\s+)(\w+)/g;
    const variables = fileText.match(variableRegex);
    return new Set(variables);
}

function getOccurrencesOfVariable(text: string, varName: string): number {
    let occurrences: number | undefined = 0;

    const variableRegex: RegExp = new RegExp(`\\W${varName}\\W`, 'g');
    occurrences = text.match(variableRegex)?.length;

    return occurrences ? occurrences: 0;
}

function getCssClassesInFile(fileText: string): Set<string> {
    const fileStyleSection = getFileSectionByType(fileText, 'style');
    const searchCssClassesRegex: RegExp = /\B\.[\w\-_]+/g;
    const cssClasses = fileStyleSection.match(searchCssClassesRegex);
    return new Set(cssClasses);
}

function getOccurrencesOfCssClasses(fileText: string, className: string): number {
    return 1;
}

function getScriptSectionNoCommentsOrStrings(fileText: string): string {
    let fileScriptSection = getFileSectionByType(fileText, 'script');
    fileScriptSection = removeCommentsFromText(fileScriptSection);
    fileScriptSection = removeStringsFromText(fileScriptSection);
    return fileScriptSection;
}

function removeCommentsFromText(text: string): string {
    const searchCommentRegex: RegExp = /\/\/[^\n]*|\/\*.*?\*\//gs;
    return text.replace(searchCommentRegex, '');
}

function removeStringsFromText(text: string): string {
    const searchStringRegex: RegExp = /".*?"|'.*?'|`.*?`/gs;
    let noStringsText = text;
    noStringsText += formatEscapesForStringAppend(
        extractFormattedStringEscapesInText(noStringsText)
    );
    noStringsText = noStringsText.replace(searchStringRegex, '');
    console.log(noStringsText);
    return noStringsText;
}

function extractFormattedStringEscapesInText(text: string): string[] {
    const searchFormattedStringsRegex: RegExp = /`.*?`/gs;
    const searchEscapesRegex: RegExp = /(?<=\$\{).*?(?=\})/gs;

    let escapes: string[] = [];
    const formattedStringsMatch: string[] | null = text.match(searchFormattedStringsRegex);
    formattedStringsMatch?.forEach(s => {
        const escapesMatch: string[] | null = s.match(searchEscapesRegex);
        if (escapesMatch) {
            escapes.push(...(escapesMatch as string[]));
        }
    });
    return escapes;
}

function formatEscapesForStringAppend(escapes: string[]): string {
    let formattedEscapesString = '\n';
    return escapes.reduce((prevString, currString) => {
        return prevString + currString + '\n';
    }, formattedEscapesString);
}

function getFileSectionByType(fileText: string, type: string): string {
    const getSectionRegex: RegExp = new RegExp(
        `(?:<\\s*?${type}[\\s\\S]*?>)([\\s\\S]*?)(?=<\\/\\s*${type})`
    );
    const sectionMatch = fileText.match(getSectionRegex);
    return sectionMatch ? sectionMatch[1]: '';
}