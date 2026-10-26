import { PlusIcon, SettingsIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default { title: "UI/Button" }

const VARIANTS = ["default", "brand", "secondary", "outline", "ghost", "destructive", "link"] as const

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-2">
    {VARIANTS.map((variant) => (
      <Button key={variant} variant={variant}>
        {variant}
      </Button>
    ))}
  </div>
)

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Button>默认</Button>
    <Button size="sm">小号</Button>
    <Button size="icon" variant="ghost" aria-label="设置">
      <SettingsIcon />
    </Button>
    <Button size="icon-sm" variant="ghost" aria-label="设置">
      <SettingsIcon />
    </Button>
  </div>
)

export const WithIcon = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Button>
      <PlusIcon data-icon="inline-start" />
      新建
    </Button>
    <Button variant="secondary">
      <PlusIcon data-icon="inline-start" />
      添加账户
    </Button>
  </div>
)

export const Disabled = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Button disabled>开始使用</Button>
    <Button variant="brand" disabled>
      brand
    </Button>
    <Button variant="secondary" disabled>
      取消
    </Button>
  </div>
)
