import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export default { title: "UI/Field" }

export const Vertical = () => (
  <FieldGroup className="w-80">
    <Field>
      <FieldLabel htmlFor="username">用户名</FieldLabel>
      <Input id="username" placeholder="suemor" />
      <FieldDescription>用于登录和展示，3～20 个字符。</FieldDescription>
    </Field>
    <Field>
      <FieldLabel htmlFor="bio">简介</FieldLabel>
      <Textarea id="bio" placeholder="介绍一下自己…" />
    </Field>
  </FieldGroup>
)

export const Horizontal = () => (
  <FieldGroup className="w-96">
    <Field orientation="horizontal">
      <FieldContent>
        <FieldLabel htmlFor="autostart">开机启动</FieldLabel>
        <FieldDescription>登录系统后自动在后台运行。</FieldDescription>
      </FieldContent>
      <Switch id="autostart" defaultChecked />
    </Field>
    <Field orientation="horizontal">
      <Checkbox id="compact" />
      <FieldLabel htmlFor="compact">紧凑模式</FieldLabel>
    </Field>
  </FieldGroup>
)

export const WithError = () => (
  <FieldSet className="w-80">
    <FieldLegend>账户</FieldLegend>
    <Field data-invalid>
      <FieldLabel htmlFor="email">邮箱</FieldLabel>
      <Input id="email" defaultValue="not-an-email" aria-invalid />
      <FieldError>请输入有效的邮箱地址</FieldError>
    </Field>
  </FieldSet>
)
