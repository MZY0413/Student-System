'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, ExternalLink, FileText } from 'lucide-react'

const DOCUMENT = {
  title: '实验班管理办法',
  fullName: '信通学院政〔2026〕5号 · 信息与通信工程学院人工智能（智能视听卓越人才）实验班培养与管理办法',
  href: '/实验班管理办法.pdf',
  fileName: '实验班管理办法.pdf',
}

export default function IndicatorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">考核指标</h1>
        <p className="text-muted-foreground">实验班考核相关文件与说明</p>
      </div>

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
          </div>
          <iframe
            src={DOCUMENT.href}
            title={DOCUMENT.title}
            className="h-[75vh] w-full rounded-lg border border-border"
          />
        </CardContent>
      </Card>
    </div>
  )
}
