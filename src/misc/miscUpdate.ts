import miscDescriptions from "./miscDescriptions";

const MAX_LABEL_LENGTH = 18;

export default function getMiscData(fileText: string): any[] {
    let suggestions = [];

    suggestions.push(...searchNoBracketSpaces(fileText));

    return suggestions;
}

function searchNoBracketSpaces(text: string): any[] {
    const searchNoBracketSpacesRegex: RegExp = /^[^\n\w]*(.*?((?:\{+\w+|\w+\}).*))/gm;
    const searchNoBracketSpacesMatch: RegExpMatchArray[] = [...text.matchAll(searchNoBracketSpacesRegex)];
    const noBracketSpacesObjs: any[] = searchNoBracketSpacesMatch.map(m => { return {
        label: getTrimmedLabel(m[2]),
        line: m[1],
        description: miscDescriptions.noBracketSpaces
    }});
    return noBracketSpacesObjs;
}

function getTrimmedLabel(label: string): string {
    return label.length < MAX_LABEL_LENGTH ? label : label.substring(0, MAX_LABEL_LENGTH) + '...';
}