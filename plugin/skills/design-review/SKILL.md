---
name: design-review
description: marchen-design 设计审查（尚未完成）。目前只提供禁用写法的扫描脚本。
---

# marchen-design 审查（未完成）

审查流程还在编写中，**目前不要据此给出审查结论**。

现在可用的只有禁用写法扫描脚本，可以对任意目录运行：

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/design-review/scripts/lint-design.mjs <目录>
```

它检查渐变、调色板颜色、写死的色值、非浮层大阴影、`cursor-pointer`、内容层毛玻璃。有违规时退出码为 1，并输出文件、行号和违规写法。
