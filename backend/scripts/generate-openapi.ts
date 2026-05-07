import fs from 'fs';
import { registerApp  } from '../src/routes';

const { openapiSpec } = registerApp();
fs.writeFileSync(
    '../shared/openapi.json',
    JSON.stringify(openapiSpec, null, 2)
);
console.log('OpenAPI spec generated!');