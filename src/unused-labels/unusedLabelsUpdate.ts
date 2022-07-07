import * as vscode from 'vscode';
import UNUSED_LABELS_TYPES from './unusedLabelsTypes';

let templateSection: string;
let styleSection: string;

export default function getUnusedLabelData(doc: vscode.TextDocument): any {
	const fileText: string = removeCommentsFromText(doc.getText());
	templateSection = getFileSectionByType(fileText, 'template', false);
	styleSection = getFileSectionByType(fileText, 'style', false);

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
	const firstWhiteSpaceMatch = styleSection.match(/^[^\n]*?(?=\.)/m);
	const firstWhitespace = firstWhiteSpaceMatch ? firstWhiteSpaceMatch[0] : '';
	const searchCssClassesRegex: RegExp = /\B\.[\w\-_]+/g;
	let cssClasses = styleSection.match(searchCssClassesRegex);

	const getTopLevelSectionsRegex: RegExp = new RegExp(
		`(\\.[\\w_\\-]+)(\\s*?\\{\\s*?\\n)(.*?)(?=^${firstWhitespace}\\})`, 'gsm'
	);
	const topLevelSectionsMatch: RegExpMatchArray[] = [...styleSection.matchAll(getTopLevelSectionsRegex)];
	topLevelSectionsMatch.forEach(s => {
		const subClasses = getSubScssClassesInText(s[3], s[1]);
		if (subClasses.length) {
			cssClasses?.push(...subClasses);
			cssClasses?.splice(cssClasses?.indexOf(s[1]), 1); // ignore parent class
		}
	});

	return new Set(cssClasses);
}
// recursive
function getSubScssClassesInText(text: string, parentClass: string): string[] {
	let subClasses: string[] = [];

	const firstWhitespaceRegex: RegExp = /^\s*?(?=&)/m;
	const firstWhitespaceMatch: RegExpMatchArray | null = text.match(firstWhitespaceRegex);
	const firstWhitespace: string = firstWhitespaceMatch ? firstWhitespaceMatch[0] : '';

	const subClassSectionsRegex: RegExp = new RegExp(
		`(&[\\w_\\-]+)(\\s*?\\{\\s*?\\n)(.*?)(?=^${firstWhitespace}\\})`, 'gsm'
	);
	const subClassSectionsMatch: RegExpMatchArray[] | null = [...text.matchAll(subClassSectionsRegex)];
	subClassSectionsMatch.forEach(s => {
		const subClass: string = s[1].replace('&', parentClass);
		const subSubClasses: string[] = getSubScssClassesInText(s[3], subClass);
		if (subSubClasses.length)
			subClasses.push(...subSubClasses);
		else
			subClasses.push(subClass);
	})

	return subClasses;
}
function getOccurrencesOfCssClasses(fileText: string, className: string): number {
	const searchClassInardsRegex: RegExp = /(?<=\bclass=").*?(?=")/gs;
	const searchClassNameRegex: RegExp = new RegExp(`\\b${className}\\b`, 'gs');
	
	let occurrences: number = 0;
	const classInardsMatch: string[] | null = templateSection.match(searchClassInardsRegex);
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
	const firstWhitespaceRegex: RegExp = new RegExp(
		`^[^\\n\\w]*?(?=<\\s*?${type})`, 'm'
	);
	const firstWhitespaceMatch = fileText.match(firstWhitespaceRegex);
	const numLines = firstWhitespaceMatch ? firstWhitespaceMatch.input?.substring(0, firstWhitespaceMatch.index).match(/\n/gs)?.length : 0;
	const firstWhitespace = firstWhitespaceMatch ? firstWhitespaceMatch[0] : '';
	const getSectionRegex: RegExp = new RegExp(
		`(?:<\\s*?${type}.*?>)(.*)(?=^${firstWhitespace}<\\/\\s*${type})`, 'sm'
	);
	const sectionMatch = fileText.match(getSectionRegex);
	if (removeStrings && sectionMatch)
		return removeStringsFromText(sectionMatch[1])
	else if (sectionMatch)
		return sectionMatch[1];
	else return '';
}