import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default { title: "UI/Tabs" }

export const Default = () => (
  <Tabs defaultValue="all" className="w-80">
    <TabsList>
      <TabsTrigger value="all">全部</TabsTrigger>
      <TabsTrigger value="watching">在看</TabsTrigger>
      <TabsTrigger value="done">看完</TabsTrigger>
      <TabsTrigger value="archived" disabled>
        归档
      </TabsTrigger>
    </TabsList>
    <TabsContent value="all" className="pt-3 text-muted-foreground">
      共 128 部
    </TabsContent>
  </Tabs>
)

export const Line = () => (
  <Tabs defaultValue="overview" className="w-80">
    <TabsList variant="line">
      <TabsTrigger value="overview">概览</TabsTrigger>
      <TabsTrigger value="episodes">剧集</TabsTrigger>
      <TabsTrigger value="comments">评论</TabsTrigger>
    </TabsList>
  </Tabs>
)
