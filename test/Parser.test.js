const { Parser } = require("../dist/Parser");

const parser = new Parser({
  appRoot: "/Users/zhoujing/git.chelun.com/wap",
  defaultProject: "/login-test",
  buildDirs: ["build", "dist"],
});

const result = parser.search('buy/preferential_vip/index.html');
console.log(result);
