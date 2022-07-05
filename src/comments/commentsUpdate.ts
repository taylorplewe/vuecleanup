import * as vscode from 'vscode';

export default function getCommentsData(fileText: string): string[] {
    const searchCommentsRegex: RegExp = /\/\/[^\n]*?(\S.*)|\/\*[\s]*((?:[\s\S])*?)(?=\*\/)/gmi;
    const commentsMatch: RegExpMatchArray[] | null = [...fileText.matchAll(searchCommentsRegex)];
    const comments: string[] = commentsMatch.map(t => t[1] ? t[1] : t[2]);
    return comments;
}