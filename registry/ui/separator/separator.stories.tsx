import { Separator } from "@/components/ui/separator"

export default { title: "UI/Separator" }

export const Horizontal = () => (
  <div className="flex w-64 flex-col gap-3 text-sm">
    <span>通用</span>
    <Separator />
    <span>外观</span>
  </div>
)

export const Vertical = () => (
  <div className="flex h-5 items-center gap-3 text-sm">
    <span>文档</span>
    <Separator orientation="vertical" />
    <span>更新日志</span>
    <Separator orientation="vertical" />
    <span>反馈</span>
  </div>
)
