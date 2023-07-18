export interface ParserOption {
    appRoot: string;
    buildDirs: Array<string>;
    defaultProject: string;
}
export declare class Parser {
    private config;
    private cache;
    constructor(config: ParserOption);
    private normalize;
    private isDirectory;
    private isFile;
    search(pathname: string): string | null;
}
