import miscDescriptions from "./miscDescriptions";

const MAX_LABEL_LENGTH = 18;

export default function getMiscData(docObj: any): any[] {
    let suggestions = [];

    suggestions.push(...searchNoBracketSpaces(docObj.all));
    suggestions.push(...searchTwoEquals(docObj.all));
    suggestions.push(...searchDoubleQuotes(docObj.scriptWithDoubleQuotes));

    return suggestions;
}

function searchNoBracketSpaces(text: string): any[] {
    const searchNoBracketSpacesRegex: RegExp = /^.*?[^\^\$](\{+(?:\w+(?:[^\{\n]|\{.*\})*?\}+|(?:[^\{\n]|\{.*\})*[^\}\s]\}+)).*/gm;
    const searchNoBracketSpacesMatch: RegExpMatchArray[] = [...text.matchAll(searchNoBracketSpacesRegex)];
    return searchNoBracketSpacesMatch.map(m => { return {
        label: getTrimmedLabel(m[1]),
        line: m[0],
        description: miscDescriptions.noBracketSpaces
    }});
}

function searchTwoEquals(text: string): any[] {
    const searchTwoEqualsRegex: RegExp = /^.*(\b\w.*?[^=!]==[^=].*?\w\b).*/gm;
    const searchTwoEqualsMatch: RegExpMatchArray[] = [...text.matchAll(searchTwoEqualsRegex)];
    return searchTwoEqualsMatch.map(m => { return {
        label: getTrimmedLabel(m[1]),
        line: m[0],
        description: miscDescriptions.twoEquals
    }});
}

function searchDoubleQuotes(text: string): any[] {
    const searchDoubleQuotesRegex: RegExp = /^.*?("[^"]*?").*/gm;
    const searchDoubleQuotesMatch: RegExpMatchArray[] = [...text.matchAll(searchDoubleQuotesRegex)];
    return searchDoubleQuotesMatch.map(m => { return {
        label: getTrimmedLabel(m[1]),
        line: m[0],
        description: miscDescriptions.doubleQuotes
    }});
}

function getTrimmedLabel(label: string): string {
    return label.length < MAX_LABEL_LENGTH ? label : label.substring(0, MAX_LABEL_LENGTH) + '...';
}