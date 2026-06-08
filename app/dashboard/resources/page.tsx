'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  FileText,
  Video,
  Link as LinkIcon,
  Download,
  ExternalLink,
  GraduationCap,
  Code,
  Brain,
  Database,
} from 'lucide-react'

const resourceCategories = [
  {
    id: 'curriculum',
    title: '培养方案',
    description: 'AI专业培养方案与课程设置',
    icon: GraduationCap,
    color: 'bg-primary/10 text-primary',
    resources: [
      { name: '人工智能专业培养方案2024', type: 'pdf', size: '2.3MB' },
      { name: '课程体系说明', type: 'pdf', size: '1.1MB' },
      { name: '毕业要求与学分分布', type: 'pdf', size: '856KB' },
    ],
  },
  {
    id: 'ml',
    title: '机器学习资料',
    description: '机器学习课程相关学习资料',
    icon: Brain,
    color: 'bg-accent/10 text-accent',
    resources: [
      { name: '机器学习课程讲义', type: 'pdf', size: '15.2MB' },
      { name: 'Scikit-learn 入门教程', type: 'link', url: 'https://scikit-learn.org' },
      { name: '吴恩达机器学习笔记', type: 'pdf', size: '8.7MB' },
      { name: '特征工程实战指南', type: 'pdf', size: '3.2MB' },
    ],
  },
  {
    id: 'dl',
    title: '深度学习资料',
    description: '深度学习与神经网络学习资源',
    icon: Code,
    color: 'bg-success/10 text-success',
    resources: [
      { name: 'PyTorch 官方教程', type: 'link', url: 'https://pytorch.org/tutorials' },
      { name: '深度学习花书笔记', type: 'pdf', size: '12.4MB' },
      { name: 'CNN 架构详解', type: 'pdf', size: '5.6MB' },
      { name: 'Transformer 原理与实现', type: 'pdf', size: '4.3MB' },
    ],
  },
  {
    id: 'data',
    title: '数据科学资料',
    description: '数据分析与数据处理学习资源',
    icon: Database,
    color: 'bg-warning/10 text-warning',
    resources: [
      { name: 'Pandas 完全指南', type: 'pdf', size: '6.8MB' },
      { name: '数据可视化实战', type: 'pdf', size: '9.1MB' },
      { name: 'SQL 必知必会', type: 'pdf', size: '3.5MB' },
    ],
  },
]

const externalLinks = [
  { name: 'Kaggle 竞赛平台', url: 'https://kaggle.com', description: '数据科学竞赛与数据集' },
  { name: 'Papers With Code', url: 'https://paperswithcode.com', description: '最新论文与代码实现' },
  { name: 'Hugging Face', url: 'https://huggingface.co', description: '预训练模型与数据集' },
  { name: 'Google Colab', url: 'https://colab.research.google.com', description: '免费GPU计算资源' },
  { name: 'arXiv', url: 'https://arxiv.org', description: '最新研究论文预印本' },
  { name: 'GitHub', url: 'https://github.com', description: '开源项目与代码托管' },
]

export default function ResourcesPage() {
  const typeConfig = {
    pdf: { icon: FileText, color: 'text-destructive' },
    video: { icon: Video, color: 'text-primary' },
    link: { icon: LinkIcon, color: 'text-accent' },
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">资源库</h1>
        <p className="text-muted-foreground">AI专业学习资料、考核文件与培养方案</p>
      </div>

      {/* 资源分类 */}
      <div className="grid gap-6 md:grid-cols-2">
        {resourceCategories.map(category => {
          const CategoryIcon = category.icon
          return (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <CategoryIcon className="w-5 h-5" />
                  </div>
                  {category.title}
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.resources.map((resource, index) => {
                    const config = typeConfig[resource.type as keyof typeof typeConfig]
                    const TypeIcon = config.icon
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <TypeIcon className={`w-5 h-5 ${config.color}`} />
                          <div>
                            <p className="font-medium text-foreground">{resource.name}</p>
                            {resource.type !== 'link' && (
                              <p className="text-xs text-muted-foreground">
                                {(resource as { size?: string }).size}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          {resource.type === 'link' ? (
                            <ExternalLink className="w-4 h-4" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 外部资源链接 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            推荐学习平台
          </CardTitle>
          <CardDescription>优质的AI学习资源与工具平台</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {externalLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors group"
              >
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <ExternalLink className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {link.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 使用说明 */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">资源使用说明</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>所有PDF资料均可下载到本地学习</li>
                <li>外部链接将在新窗口中打开</li>
                <li>如需更多学习资料，请联系任课老师或班委</li>
                <li>部分资源仅供学习使用，请勿用于商业目的</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
