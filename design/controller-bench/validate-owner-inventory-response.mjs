import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';

const here = path.dirname(new URL(import.meta.url).pathname);
const responsePath =
  process.argv[2] || path.join(here, 'owner-inventory.response.json');
const schema = JSON.parse(
  fs.readFileSync(
    path.join(here, 'owner-inventory.response.schema.json'),
    'utf8',
  ),
);
const response = JSON.parse(fs.readFileSync(responsePath, 'utf8'));
const validate = new Ajv2020({ allErrors: true }).compile(schema);

if (!validate(response)) {
  for (const error of validate.errors || [])
    console.error(`${error.instancePath || '/'} ${error.message}`);
  process.exit(1);
}

console.log(
  'Owner inventory response validated: none owned; purchase/cart/contact remain unauthorized',
);
