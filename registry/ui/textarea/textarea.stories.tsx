import { Textarea } from "@/components/ui/textarea"

export default { title: "UI/Textarea" }

export const States = () => (
  <div className="flex w-80 flex-col gap-3">
    <Textarea placeholder="描述一下你遇到的问题…" />
    <Textarea placeholder="不可编辑" disabled />
    <Textarea defaultValue="内容太短" aria-invalid />
  </div>
)
