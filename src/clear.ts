import { parentPort } from "worker_threads";
import { isFile } from "./utils";

// 清理路径不存在的键
parentPort?.on("message", (message: Record<string, string>) => {
  for (let key in message) {
    if (!isFile(message[key])) {
      delete message[key];
    }
  }
  parentPort?.postMessage(message);
});
