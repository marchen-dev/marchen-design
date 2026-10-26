import { CopyIcon, PencilIcon, ShareIcon, TrashIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default { title: "UI/Dropdown Menu", parameters: { minHeight: 300 } }

export const Actions = () => (
  <DropdownMenu defaultOpen>
    <DropdownMenuTrigger render={<Button variant="outline">操作</Button>} />
    <DropdownMenuContent align="start" className="w-48">
      <DropdownMenuGroup>
        <DropdownMenuItem>
          <PencilIcon /> 重命名 <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CopyIcon /> 复制链接 <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ShareIcon /> 分享到
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>微信</DropdownMenuItem>
            <DropdownMenuItem>邮件</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive">
        <TrashIcon /> 删除
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)

export const Options = () => {
  const [sort, setSort] = useState("updated")
  return (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger render={<Button variant="outline">显示</Button>} />
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>列</DropdownMenuLabel>
          <DropdownMenuCheckboxItem defaultChecked>名称</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem defaultChecked>大小</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>修改时间</DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>排序</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenuRadioItem value="name">按名称</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="updated">按更新时间</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
