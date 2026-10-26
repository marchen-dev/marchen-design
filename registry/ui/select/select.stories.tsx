import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"

export default { title: "UI/Select", parameters: { minHeight: 260 } }

const languages = [
  { label: "简体中文", value: "zh-CN" },
  { label: "English", value: "en" },
  { label: "日本語", value: "ja" },
]

const LanguageItems = () => (
  <SelectGroup>
    {languages.map((l) => (
      <SelectItem key={l.value} value={l.value}>
        {l.label}
      </SelectItem>
    ))}
  </SelectGroup>
)

export const Default = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Select items={languages} defaultValue="zh-CN">
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <LanguageItems />
      </SelectContent>
    </Select>
    <Select items={languages} defaultValue="en">
      <SelectTrigger size="sm" className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <LanguageItems />
      </SelectContent>
    </Select>
    <Select items={languages} defaultValue="ja" disabled>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <LanguageItems />
      </SelectContent>
    </Select>
    <Select items={languages} defaultValue="zh-CN">
      <SelectTrigger className="w-40" aria-invalid>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <LanguageItems />
      </SelectContent>
    </Select>
  </div>
)

export const Open = () => (
  <Select items={languages} defaultValue="zh-CN" defaultOpen>
    <SelectTrigger className="w-48">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>界面语言</SelectLabel>
        {languages.map((l) => (
          <SelectItem key={l.value} value={l.value}>
            {l.label}
          </SelectItem>
        ))}
      </SelectGroup>
      <SelectSeparator />
      <SelectGroup>
        <SelectItem value="system">跟随系统</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
)
