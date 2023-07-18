"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class Parser {
    constructor(config) {
        this.config = config;
        this.cache = {};
    }
    normalize(pathname) {
        return pathname.replace(/^\/*|\/*$/g, "");
    }
    isDirectory(pathname) {
        const stat = fs_1.default.statSync(pathname, { throwIfNoEntry: false });
        if (!stat)
            return false;
        return stat.isDirectory();
    }
    isFile(pathname) {
        const stat = fs_1.default.statSync(pathname, { throwIfNoEntry: false });
        if (!stat)
            return false;
        return stat.isFile();
    }
    search(pathname) {
        pathname = this.normalize(pathname);
        if (!pathname) {
            pathname = this.config.defaultProject;
            if (!pathname) {
                return null;
            }
        }
        if (this.cache[pathname]) {
            return this.cache[pathname];
        }
        const segments = pathname.split("/");
        const last = segments[segments.length - 1];
        const hasSuffix = !!path_1.default.extname(last);
        if (hasSuffix) {
            segments.pop();
        }
        let projectPath = this.config.appRoot;
        let projectIndex = -1;
        for (let i = 0; i < segments.length; i++) {
            projectPath = path_1.default.join(projectPath, segments[i]);
            if (!this.isDirectory(projectPath)) {
                return null;
            }
            const packageFile = path_1.default.join(projectPath, "package.json");
            if (this.isFile(packageFile)) {
                projectIndex = i;
                break;
            }
        }
        if (projectIndex === -1) {
            return null;
        }
        let finalDir = null;
        for (let build of this.config.buildDirs) {
            const result = path_1.default.join(projectPath, build);
            if (this.isDirectory(result)) {
                finalDir = result;
                break;
            }
        }
        if (!finalDir) {
            return null;
        }
        if (!hasSuffix) {
            return path_1.default.join(finalDir, "index.html");
        }
        for (let i = projectIndex + 1; i < segments.length; i++) {
            finalDir = path_1.default.join(finalDir, segments[i]);
            if (!this.isDirectory(finalDir)) {
                return null;
            }
        }
        const fullPath = path_1.default.join(finalDir, last);
        if (!this.isFile(fullPath)) {
            return null;
        }
        this.cache[pathname] = fullPath;
        return fullPath;
    }
}
exports.Parser = Parser;
//# sourceMappingURL=Parser.js.map