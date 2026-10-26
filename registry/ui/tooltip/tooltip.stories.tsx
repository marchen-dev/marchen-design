import { SettingsIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// Base UI 同一时间只显示一个 tooltip，单行和多行分成两个 story
export default { title: "UI/Tooltip", parameters: { minHeight: 140 } }

export const Open = () => (
  <div className="flex justify-center pt-12">
    <Tooltip defaultOpen>
      <TooltipTrigger render={<Button size="icon" variant="ghost" aria-label="设置" />}>
        <SettingsIcon />
      </TooltipTrigger>
      <TooltipContent>设置</TooltipContent>
    </Tooltip>
  </div>
)

export const Multiline = () => (
  <div className="flex justify-center pt-16">
    <Tooltip defaultOpen>
      <TooltipTrigger render={<Button variant="secondary">导出</Button>} />
      <TooltipContent>导出当前列表中的全部条目，包含已隐藏的列，文件格式为 CSV。</TooltipContent>
    </Tooltip>
  </div>
)
