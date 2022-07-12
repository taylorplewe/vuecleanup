export default function getLeftoversData(fileText: string): any {
    let leftoversData: any = {};
    leftoversData.comments = getCommentsFromText(fileText);
    leftoversData.todos = getTodosFromText(fileText);
    leftoversData.logs = getLogsFromText(fileText);
    return leftoversData;
}


function getCommentsFromText(fileText: string): string[] {
    const searchCommentsRegex: RegExp = /\/\/[^\n]*?(\S.*)|\/\*[\s\*]*((?:[\s\S])*?)(?=\*\/)|<!--\s*(.*)(?=\s*-->)/gmi;
    const commentsMatch: RegExpMatchArray[] | null = [...fileText.matchAll(searchCommentsRegex)];
    const comments: string[] = commentsMatch.map(t => t[1] ? t[1] : t[2] ? t[2] : t[3]);
    return filterOutTodosFromComments(comments);
}

function filterOutTodosFromComments(comments: string[]): string[] {
    const filterTodosRegex = /^todo/i;
    return comments.filter(c => !c.match(filterTodosRegex));
}

function getTodosFromText(fileText: string): string[] {
    const searchTodosRegex: RegExp = /\/\/\s*?todo:*[^\n\w]*?(\w.*)|\/\*\s*?todo\W*(.*)(?=[\s\S]*?\*\/)/gmi;
    const todosMatch: RegExpMatchArray[] | null = [...fileText.matchAll(searchTodosRegex)];
    const todos: string[] = todosMatch.map(t => t[1] ? t[1] : t[2]);
    return todos;
}

function getLogsFromText(text: string): string[] {
    const searchLogsRegex: RegExp = /console\.log\(.*\)/g;
    const searchLogsMatch: string[] | null = text.match(searchLogsRegex);
    if (searchLogsMatch) return searchLogsMatch;
    else return [];
}