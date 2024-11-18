# 贡献指南

如果你有任何疑问，欢迎提交 [issue](https://github.com/difizen/libro/issues) 或 [PR](https://github.com/difizen/libro/pulls)!

## 贡献 issue

- 确定 issue 的类型。
- 避免提交重复的 issue，在提交之前搜索现有的 issue。
- 尽可能完整的填写 issue 表单信息。
- 在标签、标题或内容中体现明确的意图。

随后 libro 负责人会确认 issue 意图，更新合适的标签，指派开发者。

## 贡献代码

### Fork 仓库

1. 点击项目页面上的“Fork”按钮，Fork 您想要贡献的仓库。

2. 使用以下命令将仓库克隆到您的本地计算机：

   ```bash
   git clone https://github.com/<YOUR-GITHUB-USERNAME>/libro
   ```

请将 `<YOUR-GITHUB-USERNAME>` 替换为您的 GitHub 用户名。

### 启动 libro 服务

1. 使用以下命令将 libro-server 仓库克隆到您的本地计算机：

   ```bash
   git clone https://github.com/difizen/libro-server.git
   ```

2. 我们使用 rye 来管理多 python 包组成 monorepo，多个包会共享同一个虚拟环境 venv，确保您的环境中已安装 Python 环境 以及 rye Python 管理工具。

3. 安装与同步必要的 Python 依赖：

   ```bash
   rye sync
   ```

4. 启动 libro 服务：

   ```bash
   cd libro
   rye run dev
   ```

如果一切正常，您会看到 libro 服务成功启动。

### 启动 libro

切换到对应的 [Fork 仓库](#fork-仓库)

1. 安装与同步必要的依赖：

   ```bash
   pnpm bootstrap
   ```

2. 以开发 Demo 的形态启动项目：

   ```bash
   pnpm run docs
   ```

3. 进行代码开发

### 添加 changelog

1. 请运行以下命令为您的变更创建一条变更日志：

   ```bash
   pnpm run changeset
   ```

2. 根据提示填写以下内容：

- 修改了哪些包？
- 这些变更是 major、minor 还是 patch？
- 添加对变更的简要描述。

### 提交 Pull Request

你可以创建分支修改代码提交 PR，libro 开发团队会 review 代码合并到主干。

    ```bash
    # 先创建开发分支开发，分支名应该有含义，避免使用 update、tmp 之类的
    git checkout -b branch-name

    # 开发完成后跑下测试是否通过，必要时需要新增或修改测试用例
    pnpm run ci:check

    # 测试通过后，提交代码，message 见下面的规范

    git add . # git add -u 删除文件
    git commit -m "fix(role): role.use must xxx"
    git push origin branch-name
    ```

提交后就可以在 [libro](https://github.com/difizen/libro/pulls) 创建 Pull Request 了。

由于谁也无法保证过了多久之后还记得多少，为了后期回溯历史的方便，请在提交 MR 时确保提供了以下信息。

1. 需求点（一般关联 issue 或者注释都算）
2. 升级原因（不同于 issue，可以简要描述下为什么要处理）
3. 测试点（可以关联到测试文件，不用详细描述，关键点即可）
4. 关注点（针对用户而言，可以没有，一般是不兼容更新等，需要额外提示）

### 代码风格

你的代码风格必须通过 eslint，你可以运行 `$ pnpm run lint` 本地测试。

### Commit 提交规范

根据 [angular 规范](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit-message-format)提交 commit，这样 history 看起来更加清晰，还可以自动生成 changelog。

```xml
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

（1）type

提交 commit 的类型，包括以下几种

- feat: 新功能
- fix: 修复问题
- docs: 修改文档
- style: 修改代码格式，不影响代码逻辑
- refactor: 重构代码，理论上不影响现有功能
- perf: 提升性能
- test: 增加修改测试用例
- chore: 修改工具相关（包括但不限于文档、代码生成等）
- deps: 升级依赖

（2）scope

修改文件的范围

（3）subject

用一句话清楚的描述这次提交做了什么

（4）body

补充 subject，适当增加原因、目的等相关因素，也可不写。

（5）footer

- 当有非兼容修改(Breaking Change)时必须在这里描述清楚
- 关联相关 issue，如 `Closes #1, Closes #2, #3`

查看具体[文档](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit)
