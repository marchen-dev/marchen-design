import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

export default { title: "UI/Card" }

export const Complete = () => (
  <Card className="w-96">
    <CardHeader>
      <CardTitle>存储空间</CardTitle>
      <CardDescription>已使用 12.4 GB，共 50 GB。</CardDescription>
      <CardAction>
        <Button variant="ghost" size="sm">
          管理
        </Button>
      </CardAction>
    </CardHeader>
    <CardContent className="text-muted-foreground">缓存会在 30 天未访问后自动清理。</CardContent>
    <CardFooter className="justify-end gap-2">
      <Button variant="secondary" size="sm">
        清除缓存
      </Button>
    </CardFooter>
  </Card>
)

/** 设置分组：卡片里是"名称 ↔ 控件"行，行与行之间不加分隔线 */
export const SettingsGroup = () => (
  <div className="w-96 bg-background p-4">
    <Card size="sm" className="gap-0 py-0">
      <Field orientation="horizontal" className="items-center! px-4 py-3">
        <FieldContent>
          <FieldLabel htmlFor="c-autostart">开机启动</FieldLabel>
          <FieldDescription>登录系统后自动运行。</FieldDescription>
        </FieldContent>
        <Switch id="c-autostart" defaultChecked />
      </Field>
      <Field orientation="horizontal" className="items-center! px-4 py-3">
        <FieldLabel htmlFor="c-tray">最小化到托盘</FieldLabel>
        <Switch id="c-tray" />
      </Field>
    </Card>
  </div>
)
