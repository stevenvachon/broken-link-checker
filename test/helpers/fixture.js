import {createReadStream, readFileSync} from "fs";
import {resolve as resolvePath} from "path";



export const fixturePath = (path="") => resolvePath(`${__dirname}/../fixtures-http/${path}`);

export const fixtureStream = path => createReadStream(fixturePath(path));

export const fixtureString = path => readFileSync(fixturePath(path), "utf8");
