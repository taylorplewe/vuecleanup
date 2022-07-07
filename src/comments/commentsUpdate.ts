export default function getCommentsData(fileText: string): string[] {
    const searchCommentsRegex: RegExp = /\/\/[^\n]*?(\S.*)|\/\*[\s\*]*((?:[\s\S])*?)(?=\*\/)|<!--\s*(.*)(?=\s*-->)/gmi;
    const commentsMatch: RegExpMatchArray[] | null = [...fileText.matchAll(searchCommentsRegex)];
    const comments: string[] = commentsMatch.map(t => t[1] ? t[1] : t[2] ? t[2] : t[3]);
    return filterOutTodosFromComments(comments);;
}

function filterOutTodosFromComments(comments: string[]): string[] {
    const filterTodosRegex = /^todo/i;
    return comments.filter(c => !c.match(filterTodosRegex));
}