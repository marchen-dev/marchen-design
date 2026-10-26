import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"

export default { title: "UI/Popover", parameters: { minHeight: 200 } }

export const Open = () => (
  <Popover defaultOpen>
    <PopoverTrigger render={<Button variant="outline">同步状态</Button>} />
    <PopoverContent align="start">
      <PopoverHeader>
        <PopoverTitle>已同步</PopoverTitle>
        <PopoverDescription>上次同步于 2 分钟前，共 3 台设备。</PopoverDescription>
      </PopoverHeader>
    </PopoverContent>
  </Popover>
)
