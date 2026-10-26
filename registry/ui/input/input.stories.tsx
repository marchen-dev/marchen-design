import { Input } from "@/components/ui/input"

export default { title: "UI/Input" }

export const States = () => (
  <div className="flex w-72 flex-col gap-3">
    <Input placeholder="搜索设置…" />
    <Input defaultValue="suemor" />
    <Input placeholder="不可编辑" disabled />
    <Input defaultValue="not-an-email" aria-invalid />
  </div>
)

export const File = () => (
  <div className="w-72">
    <Input type="file" />
  </div>
)
