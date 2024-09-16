import { singleton } from '@difizen/mana-app';

@singleton()
export class SqlScript {
  public readonly getDbConfig: string = `from libro_sql.database import db
db.get_db_config().json()`;
}
