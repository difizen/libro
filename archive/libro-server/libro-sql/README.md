# libro-sql

# 使用

## 加载

```shell
%load_ext libro_sql
```

# 设置

```python
from libro_sql.database import db
db.config({
    'db_type': '',
    'username': '',
    'password': '',
    'host': '',
    'port': 5432,
    'database': ''
})
```

# 执行

```python
%%sql
{"result_variable":"a", "sql_script":"select 1"}
```
