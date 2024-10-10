import { singleton } from '@difizen/mana-app';

@singleton()
export class SqlScript {
  public readonly getDbConfig: string = `from libro_sql.database import db\nimport json\njson.dumps(db.to_dbs_array())`;
}
