# MSPAS

团队项目中可能会存在一个目录下有多个 `Vite` 或者 `Create React App`等脚手架开发的单页应用程序(SPA)，MSPAS就是为了提供同一个根目录下存在多个不同目录不同层级的SPA应用程序带来的子目录问题，例如：

- https://example.com/path/to/a
- https://example.com/path/to/b
- https://example.com/path/to/deep/c

虽然a, b, c是三个独立且不同的的SPA应用程序入口，但是MSPAS都可以支持这种类型的路由查找，假设通过浏览器请求地址，整个过程如下：

请求：https://example.com/path/to/a/client/route


1. 浏览器将URL请求发送到服务器
2. 服务器解析到SPA项目路径 `/path/to/a`
3. 服务器将 `/path/to/a/[dist]/index.html` 响应给浏览器（dist为构建目录名，可配置）
4. 浏览器加载对应的SPA项目中的JS等资源
4. JS会将路径中剩余部分 `client/route` 当做基于`History`的本地路由
