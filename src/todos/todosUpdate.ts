export default function getTodosData(fileText: string): string[] {
    const searchTodosRegex: RegExp = /\/\/\s*?todo:*[^\n\w]*?(\w.*)|\/\*\s*?todo\W*(.*)(?=[\s\S]*?\*\/)/gmi;
    const todosMatch: RegExpMatchArray[] | null = [...fileText.matchAll(searchTodosRegex)];
    const todos: string[] = todosMatch.map(t => t[1] ? t[1] : t[2]);
    return todos;
}