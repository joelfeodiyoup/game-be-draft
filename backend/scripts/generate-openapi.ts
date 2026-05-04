import fs from 'fs';
import { openapiSpec } from '../src/routes';

console.log('hellooooo');
console.log(openapiSpec);
fs.writeFileSync(
    '../shared/openapi.json',
    JSON.stringify(openapiSpec, null, 2)
);
console.log('OpenAPI spec generated!');