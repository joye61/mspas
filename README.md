# mspas

Multi-project Single Page Application Server

## Usage

```
# install package
npm install -g mspas

# via cli command
mspas -r /path/to/your/spa-project
```

## Command line options

- `-f`: Application configuration files, have lower priority than options
- `-r`: Application root directory
- `-p`: Application listening port number, Default 1714
- `-b`: List of allowed build directory names, Default "build" | "dist"
- `-d`: Default project path for root path mapping
- `-m`: Static resource cache time, in seconds

> If you want to support multiple applications, it can only be achieved through configuration files. The configuration file is a standard json file

## Call via API

```ts
import { runApp } from "mspas";

// App config interface
type AppConfig = {
  port?: number | string;
  proxy?: boolean;
  maxAge?: number;
  appRoot?: string;
  buildDirs?: Array<string>;
  defaultProject?: string;
}

runApp({
  /** app config */
});
```


