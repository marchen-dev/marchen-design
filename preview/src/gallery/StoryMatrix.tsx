import { useEffect, useRef, useState } from "react"
import { ACCENTS, FRAME_HEIGHT_MESSAGE, THEMES, frameUrl, type StoryGroup } from "./stories"

const CELLS = THEMES.flatMap((theme) => ACCENTS.map((accent) => ({ theme, accent })))

function FrameCell({ src, minHeight }: { src: string; minHeight?: number }) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(minHeight ?? 80)

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== ref.current?.contentWindow) return
      if (event.data?.type === FRAME_HEIGHT_MESSAGE) setHeight(Math.max(event.data.height, minHeight ?? 0))
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [minHeight])

  return (
    <iframe
      ref={ref}
      src={src}
      loading="lazy"
      title={src}
      className="block w-full rounded-lg border border-border"
      style={{ height }}
    />
  )
}

export function StoryMatrix({ group }: { group: StoryGroup }) {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-base font-medium">{group.title}</h1>
      {group.stories.map((story) => (
        <section key={story.id} className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">{story.name}</h2>
          <div
            className={
              group.meta.parameters?.layout === "page" ? "flex flex-col gap-3" : "grid grid-cols-2 gap-3 xl:grid-cols-4"
            }
          >
            {CELLS.map(({ theme, accent }) => (
              <figure key={`${theme}-${accent}`} className="flex min-w-0 flex-col gap-1">
                <figcaption className="text-xs text-muted-foreground">
                  {theme} · {accent}
                </figcaption>
                <FrameCell src={frameUrl(story.id, theme, accent)} minHeight={group.meta.parameters?.minHeight} />
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
