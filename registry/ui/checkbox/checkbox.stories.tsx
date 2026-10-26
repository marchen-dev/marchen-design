import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default { title: "UI/Checkbox" }

export const States = () => (
  <div className="flex flex-col gap-3">
    <Label>
      <Checkbox /> 紧凑模式
    </Label>
    <Label>
      <Checkbox defaultChecked /> 显示行号
    </Label>
    <Label>
      <Checkbox disabled /> 不可用
    </Label>
    <Label>
      <Checkbox aria-invalid /> 我已阅读并同意（必选）
    </Label>
  </div>
)
