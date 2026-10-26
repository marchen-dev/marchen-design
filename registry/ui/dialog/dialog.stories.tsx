import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default { title: "UI/Dialog", parameters: { minHeight: 400 } }

export const Open = () => (
  <Dialog defaultOpen>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>重命名播放列表</DialogTitle>
        <DialogDescription>新名称会同步到所有设备。</DialogDescription>
      </DialogHeader>
      <Field>
        <FieldLabel htmlFor="playlist-name">名称</FieldLabel>
        <Input id="playlist-name" defaultValue="周末补番" />
      </Field>
      <DialogFooter>
        <DialogClose render={<Button variant="secondary" />}>取消</DialogClose>
        <Button>保存</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

export const Confirm = () => (
  <Dialog defaultOpen>
    <DialogContent showCloseButton={false}>
      <DialogHeader>
        <DialogTitle>删除这个播放列表？</DialogTitle>
        <DialogDescription>列表中的 24 个条目会一并移除，此操作无法撤销。</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose render={<Button variant="secondary" />}>取消</DialogClose>
        <Button variant="destructive">删除</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
