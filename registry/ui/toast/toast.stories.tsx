import { useEffect } from "react"
import { Toaster, toast } from "@/components/ui/toast"

export default { title: "UI/Toast", parameters: { minHeight: 220 } }

/** 挂载 Toaster 并显示几条不会自动消失的通知（timeout: 0） */
function Demo({ items }: { items: Parameters<typeof toast.add>[0][] }) {
  useEffect(() => {
    const ids = items.map((item) => toast.add({ timeout: 0, ...item }))
    return () => ids.forEach((id) => toast.close(id))
  }, [items])
  return <Toaster />
}

const saved = [{ title: "已保存", description: "设置已同步到所有设备。", type: "success" }]
const failed = [{ title: "同步失败", description: "网络连接已断开，将在恢复后重试。", type: "error" }]

export const Success = () => <Demo items={saved} />
export const Failure = () => <Demo items={failed} />
