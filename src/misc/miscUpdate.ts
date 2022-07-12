import miscDescriptions from "./miscDescriptions";

const MAX_LABEL_LENGTH = 18;

export default function getMiscData(docObj: any): any[] {
    let suggestions = [];

    suggestions.push(...searchNoBracketSpaces(docObj.all));
    suggestions.push(...searchTwoEquals(docObj.all));
    suggestions.push(...searchDoubleQuotes(docObj.scriptWithDoubleQuotes));
    suggestions.push(...searchEqualsTrue(docObj.template));
    suggestions.push(...searchCamelCase(docObj.template));

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

function searchEqualsTrue(text: string): any[] {
    const searchEqualsTrueRegex: RegExp = /.*?(:(\w+)="true").*?/g;
    const searchEqualsTrueMatch: RegExpMatchArray[] = [...text.matchAll(searchEqualsTrueRegex)];
    return searchEqualsTrueMatch.map(m => { return {
        label: getTrimmedLabel(m[1]),
        line: m[0],
        description: miscDescriptions.equalsTrue + m[2]
    }});
}

function searchCamelCase(text: string): any[] {
    const searchCamelCaseRegex: RegExp = /.*?(\<\/?\w+[A-Z][^\n]*\>?|[:@]?\b\w+[A-Z]\w*?=).*?/g;
    const searchCamelCaseMatch: RegExpMatchArray[] = [...text.matchAll(searchCamelCaseRegex)];
    return searchCamelCaseMatch.map(m => { return {
        label: getTrimmedLabel(m[1]),
        line: m[0],
        description: miscDescriptions.camelCase
    }});
}

function getTrimmedLabel(label: string): string {
    return label.length < MAX_LABEL_LENGTH ? label : label.substring(0, MAX_LABEL_LENGTH) + '...';
}