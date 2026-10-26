## 背景

站点已部署到 EdgeOne Pages（自定义域名 `design.suemor.com`，DNS 解析中），但构建命令、Node 版本、环境变量都只填在控制台里，换人或重建项目都要重新填；`pnpm build` 也不会构建 registry，部署时要在控制台额外写 `pnpm registry:build && pnpm build`。仓库已公开（`marchen-dev/marchen-design`），还缺 README 和 LICENSE。

方案：
- 部署配置放进仓库：`edgeone.json`（构建、安装、输出目录、Node 版本、`/r/*.json` 缓存头）；`build` 脚本先构建 registry；`REGISTRY_URL` 默认改为 `https://design.suemor.com`；`packageManager` 固定 pnpm 版本；删掉多余的 `registry:serve`。
- 补 README（是什么、在线文档、shadcn 安装、Claude Code plugin 安装、本地开发）和 MIT LICENSE（版权人 suemor233）。
- `AGENTS.md`：措辞调整、补充 story title 约定、更新部署说明。

作者信息和示例数据保持 `suemor233` 不变。

## 1. 部署配置

- [x] 1.1 `scripts/build-registry.mjs`：`REGISTRY_URL` 默认值改为 `https://design.suemor.com`，确认冒烟测试（显式传地址）不受影响
- [x] 1.2 `package.json`：`build` 改为先执行 registry 构建；加 `packageManager: pnpm@10.33.4`；删除 `registry:serve`
- [x] 1.3 新增 `edgeone.json`：`buildCommand`、`installCommand`、`outputDirectory`、`nodeVersion: 22.21.1`，`/r/*` 设置短缓存的 `Cache-Control`
- [x] 1.4 本地验证：`pnpm build` 后 `dist/r/base.json` 存在、地址为 `https://design.suemor.com`、不含 localhost；`pnpm preview` 能访问 `/r/`

## 2. 仓库信息

- [x] 2.1 新增 MIT `LICENSE`，版权人 suemor233
- [x] 2.2 新增 `README.md`：简介、在线文档地址、shadcn 安装（init / 按命名空间 add / 切换强调色）、Claude Code plugin 安装（并说明 skill 尚未完成）、本地开发命令、许可证
- [x] 2.3 `AGENTS.md`："内部源"改为"镜像源"；补充"story 的 title 要与文件夹 / 文件名对应"；命令表与部署说明同步更新

## 3. 收尾

- [x] 3.1 `pnpm check` 通过；提交并推送
