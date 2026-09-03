'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Download, ExternalLink, FileText, ListChecks } from 'lucide-react'

const DOCUMENT = {
  title: '实验班管理办法',
  fullName: '信通学院政〔2026〕5号 · 信息与通信工程学院人工智能（智能视听卓越人才）实验班培养与管理办法',
  href: '/实验班管理办法.pdf',
  fileName: '实验班管理办法.pdf',
}

export default function IndicatorsPage() {
  const [docOpen, setDocOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">考核指标</h1>
        <p className="text-muted-foreground">实验班考核相关文件与说明</p>
      </div>

      {/* 总结 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ListChecks className="h-5 w-5 text-primary" />
            总结
          </CardTitle>
          <CardDescription>实验班贯通考核要求概览</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-base font-semibold text-foreground">实验班贯通考核</p>

          {/* 基础 */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">基础</h3>
            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
              <li>无违纪、身心健康</li>
              <li>绩点：每学年≥3.0，三年平均≥3.3；国赛二等奖及以上（前3）可放宽</li>
            </ol>
          </section>

          {/* 大三总考核 */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">大三总考核（全部完成）</h3>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">1. 科研实践（二选一）</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>主持校级及以上大创</li>
                <li>参与省部级以上课题，产出认定成果</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">2. 学术成果（二选一，中传为第一单位）</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>核心/CCF-C及以上论文、授权发明专利</li>
                <li>高水平竞赛：省一（第1）/国赛（前3）/CCF国际竞赛（前3）</li>
              </ul>
              <p className="text-sm text-muted-foreground">老师一作，学生二作视同第一</p>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">3. 外语（任选其一）</p>
              <p className="text-sm text-muted-foreground">四级≥500｜六级≥425｜雅思≥6.0｜托福≥70</p>
            </div>
          </section>

          {/* 最终 */}
          <section className="space-y-1.5 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <h3 className="text-sm font-semibold text-foreground">最终</h3>
            <p className="text-sm text-muted-foreground">
              全部达标 + 满足学校推免条件，审核通过，获得本研贯通推免资格。
            </p>
          </section>
        </CardContent>
      </Card>

      {/* 文件（默认折叠，点击展开预览） */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            {DOCUMENT.title}
          </CardTitle>
          <CardDescription>{DOCUMENT.fullName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <a href={DOCUMENT.href} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                在线查看
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={DOCUMENT.href} download={DOCUMENT.fileName}>
                <Download className="h-4 w-4" />
                下载文件
              </a>
            </Button>
            <Button variant="ghost" onClick={() => setDocOpen(v => !v)}>
              {docOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {docOpen ? '收起预览' : '展开预览'}
            </Button>
          </div>
          {docOpen && (
            <iframe
              src={DOCUMENT.href}
              title={DOCUMENT.title}
              className="h-[75vh] w-full rounded-lg border border-border"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
