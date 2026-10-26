import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default { title: "UI/Switch" }

export const States = () => (
  <div className="flex flex-col gap-3">
    <Label>
      <Switch defaultChecked /> 开机启动
    </Label>
    <Label>
      <Switch /> 发送使用数据
    </Label>
    <Label>
      <Switch disabled defaultChecked /> 已锁定
    </Label>
    <Label>
      <Switch size="sm" defaultChecked /> 小号
    </Label>
  </div>
)
