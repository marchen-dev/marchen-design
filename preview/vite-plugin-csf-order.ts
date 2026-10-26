// 给 *.stories.tsx 注入 __namedExportsOrder（Storybook CSF 约定）
// ES 模块命名空间对象的键按字母排序，运行时拿不到源码顺序，只能在构建时注入
import ts from "typescript"
import type { Plugin } from "vite"

const ORDER_KEY = "__namedExportsOrder"

/** 按源码顺序取出具名导出（不含 default 和已有的 __namedExportsOrder） */
export function namedExportsInOrder(code: string, fileName = "x.tsx"): string[] {
  const source = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX)
  const names: string[] = []
  const isExported = (node: ts.Node) =>
    ts.canHaveModifiers(node) &&
    (ts.getModifiers(node) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword) &&
    !(ts.getModifiers(node) ?? []).some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)

  for (const statement of source.statements) {
    if (ts.isVariableStatement(statement) && isExported(statement)) {
      for (const decl of statement.declarationList.declarations)
        if (ts.isIdentifier(decl.name)) names.push(decl.name.text)
    } else if (ts.isFunctionDeclaration(statement) && isExported(statement) && statement.name) {
      names.push(statement.name.text)
    } else if (ts.isExportDeclaration(statement) && !statement.isTypeOnly && !statement.moduleSpecifier) {
      const clause = statement.exportClause
      if (clause && ts.isNamedExports(clause))
        for (const el of clause.elements) if (!el.isTypeOnly) names.push(el.name.text)
    }
  }
  return names.filter((n) => n !== "default" && n !== ORDER_KEY)
}

export function csfOrder(): Plugin {
  return {
    name: "marchen-design:csf-order",
    enforce: "pre",
    transform(code, id) {
      if (!/\.stories\.tsx$/.test(id.split("?")[0])) return
      if (code.includes(ORDER_KEY)) return // 作者已显式声明顺序
      const names = namedExportsInOrder(code, id)
      return { code: `${code}\nexport const ${ORDER_KEY} = ${JSON.stringify(names)}\n`, map: null }
    },
  }
}
