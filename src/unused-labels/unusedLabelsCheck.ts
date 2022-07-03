import { join } from 'path';
import * as vscode from 'vscode';
import UNUSED_LABELS_TYPES from './unusedLabelsTypes';

export default function checkForUnusedLabels(doc: vscode.TextDocument): any {
	const fileText: string = removeCommentsFromText(doc.getText());
	const varsInFile: Set<string> = getVarsInFile(fileText);
	const cssClassesInFile: Set<string> = getCssClassesInFile(fileText);
	const dataMembersInFile: Set<string> = getDataMembersInFile(fileText);
	const computedsInFile: Set<string> = getKeysOfNestedObject(fileText, 'computed');
	const methodsInFile: Set<string> = getKeysOfNestedObject(fileText, 'methods');

	let labelsWithOccurrences: any = buildLabelsWithOccurrences();

	const scriptSectionNoCommentsOrStrings = getFileSectionByType(fileText, 'script', true);
	varsInFile.forEach(v => {
		// NOTE I should be able to search for variables in their own scope instead of doing this
		labelsWithOccurrences.variables[v] =
			getOccurrencesOfAnyPropertyInText(scriptSectionNoCommentsOrStrings, v);
	});
	cssClassesInFile.forEach(c => {
		labelsWithOccurrences.cssClasses[c] = getOccurrencesOfCssClasses(fileText, c.substring(1)) + 1;
	});
	dataMembersInFile.forEach(d => {
		labelsWithOccurrences.dataMembers[d] = getOccurrencesOfAnyPropertyInText(fileText, d);
	});
	computedsInFile.forEach(c => {
		labelsWithOccurrences.computeds[c] = getOccurrencesOfAnyPropertyInText(fileText, c);
	});
	methodsInFile.forEach(m => {
		labelsWithOccurrences.methods[m] = getOccurrencesOfAnyPropertyInText(fileText, m);
	})

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
	const variablesRegex: RegExp = /(?<=\s+(var|let|const)\s+)(\w+)/g;
	const variablesMatch: string[] | null = fileText.match(variablesRegex);
	const variables: string[] = variablesMatch ? variablesMatch : [];
	return new Set(variables);
}

function getCssClassesInFile(fileText: string): Set<string> {
	const fileStyleSection = getFileSectionByType(fileText, 'style', false);
	const searchCssClassesRegex: RegExp = /\B\.[\w\-_]+/g;
	const cssClasses = fileStyleSection.match(searchCssClassesRegex);
	return new Set(cssClasses);
}
function getOccurrencesOfCssClasses(fileText: string, className: string): number {
	const fileTemplateSection: string = getFileSectionByType(fileText, 'template', false);
	const searchClassInardsRegex: RegExp = /(?<=\bclass=").*?(?=")/gs;
	const searchClassNameRegex: RegExp = new RegExp(`\\b${className}\\b`, 'gs');
	
	let occurrences: number = 0;
	const classInardsMatch: string[] | null = fileTemplateSection.match(searchClassInardsRegex);
	if (classInardsMatch) {
		classInardsMatch.forEach(m => {
			const classNameMatch = m.match(searchClassNameRegex);
			if (classNameMatch) occurrences += classNameMatch.length;
		})
	}
	return occurrences;
}

function getDataMembersInFile(fileText: string): Set<string> {
	const getDataSectionRegex: RegExp =
		/(?:data\s*?\(\s*?\)\s*?\{.*?return\s*?\{)(([^\{]|\{.*?\})*?)(?=\})/s;
	const getDataMemberNamesRegex: RegExp =
		/(?:\s*.*?)(\w+)(?:(?:[^\{\[]|\{.*?\}|\[.*?\])*?(?:\,|$))/gsy;

	const fileDataSectionMatch: string[] | null = fileText.match(getDataSectionRegex);
	const fileDataSection: string = fileDataSectionMatch ? fileDataSectionMatch[1] : '';
	const dataNamesMatch: RegExpMatchArray[] = [...fileDataSection.matchAll(getDataMemberNamesRegex)];
	const dataNames: string[] = dataNamesMatch.map(n => n[1]);

	return new Set(dataNames);
}
// handles searching for variables, computed properties, data members
function getOccurrencesOfAnyPropertyInText(text: string, property: string): number {
	const allButStyleRegex: RegExp = /.*?(?=<\s*style|$)/s;
	const searchPropertyRegex: RegExp = new RegExp(`\\b${property}\\b`, 'gs');

	const allButStyleMatch: string[] | null = text.match(allButStyleRegex);
	const allButStyle: string = allButStyleMatch ? allButStyleMatch[0] : '';
	const propertyMatch: string[] | null = allButStyle.match(searchPropertyRegex);
	return propertyMatch ? propertyMatch.length : 0;
}

function getKeysOfNestedObject(fileText: string, objectName: string): Set<string> {
	const objectInards = getNestedObjectInards(fileText, objectName);
	const getFirstWhitespaceRegex: RegExp = /^.*?(?=\w)/m;
	const firstWhitespace: any = objectInards.match(getFirstWhitespaceRegex)?.at(0);

	const getKeysRegex: RegExp = new RegExp(
		`(?:^${firstWhitespace})(\\w+)(?=\\s*?\\(.*?\\)\\s*?\\{)`, 'gm'
	);
	const keysMatch: RegExpMatchArray[] = [...objectInards.matchAll(getKeysRegex)];
	const keys: string[] = keysMatch.map(m => m[1]);
	return new Set(keys);
}

// {objectName}: { ... } -> returns ...
function getNestedObjectInards(fileText: string, objectName: string): string {
	const getFirstWhitespaceRegex: RegExp = new RegExp(
		`\\n\\s*?(?=${objectName}\\s*?:\\s*?\\{)`, 's'
	);
	const firstWhitespace: any = fileText.match(getFirstWhitespaceRegex)?.at(0);
	const getInardsRegex: RegExp = new RegExp(
		`(?:\\s*?${objectName}\\s*?:\\s*?\\{)(.*?)(?=${firstWhitespace}\\})`, 's'
	);
	const inardsMatch: RegExpMatchArray | null = fileText.match(getInardsRegex);
	return inardsMatch ? inardsMatch[1] : '';
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

function getFileSectionByType(fileText: string, type: string, removeStrings: boolean): string {
	const getSectionRegex: RegExp = new RegExp(
		`(?:<\\s*?${type}[\\s\\S]*?>)([\\s\\S]*?)(?=<\\/\\s*${type})`
	);
	const sectionMatch = fileText.match(getSectionRegex);
	if (removeStrings && sectionMatch)
		return removeStringsFromText(sectionMatch[1])
	else if (sectionMatch)
		return sectionMatch[1];
	else return '';
}