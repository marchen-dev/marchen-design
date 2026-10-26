import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export default { title: "UI/Scroll Area" }

const episodes = Array.from({ length: 24 }, (_, i) => `第 ${i + 1} 集`)

export const Vertical = () => (
  <ScrollArea className="h-48 w-56 rounded-lg ring-1 ring-foreground/10">
    <div className="flex flex-col p-1">
      {episodes.map((e) => (
        <div key={e} className="rounded-sm px-2.5 py-1.5 text-sm">
          {e}
        </div>
      ))}
    </div>
  </ScrollArea>
)

export const Horizontal = () => (
  <ScrollArea className="w-80 rounded-lg ring-1 ring-foreground/10">
    <div className="flex w-max gap-2 p-3">
      {episodes.map((e) => (
        <div key={e} className="flex h-16 w-24 items-center justify-center rounded-md bg-muted text-sm">
          {e}
        </div>
      ))}
    </div>
    <ScrollBar orientation="horizontal" />
  </ScrollArea>
)
