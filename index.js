import { readFileSync } from 'node:fs';

const config = JSON.parse( // this const import json configuration schema from config folder
  await readFileSync(
    new URL(`./config/config_data.json`, import.meta.url)
  )
);
console.log(JSON.stringify(config,undefined,2))

const schema = JSON.parse(// this const import json schema name from config_data archive 
  await readFileSync(
    new URL(`./schema/${config.validator[0].schema_name[0]}.json`, import.meta.url)
  )
);
  console.log(JSON.stringify(schema,undefined,2))
