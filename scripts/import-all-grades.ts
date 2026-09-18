// 导入全班 24 名同学的第一学期（2025-2026 学年 秋季）各科成绩
// 数据来源：中国传媒大学 2025 级人工智能（智能视听卓越人才实验班）成绩明细
// 用法：npm run import:all-grades
// 幂等：courses 按课程号 upsert，student_courses 按 (student_id, course_id) upsert
// 说明：
//   - 军事技能为五级制（优/良/及格），无百分制分数，记录为「通过」且不写分数
//   - 大学英语分 A1/B1/C1 三个等级，每名同学只修一门（勿与分数混淆）
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('请在 .env.local 中配置 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

const ACADEMIC_YEAR = '2025-2026学年'
const SEMESTER = '第一学期'

// 课程号（真实课程号来自成绩单；T9 开头为通识选修课占位课程号，成绩单未提供编号）
const g = {
  gaoshu: '2131010036', // 高等数学（上）
  sixiu: '2211010025', // 思想道德与法治
  laodong: '1311040104', // 劳动教育
  xisixiang: '2211010029', // 习近平新时代中国特色社会主义思想概论
  zhigui: '2191010002', // 大学生职业生涯规划
  cpp: '2111010036', // C/C++语言程序设计
  zhinenchuanmei: '2111010039', // 智能传媒技术导论
  xiandai: '2131010033', // 线性代数
  yingA1: 'T9000002', // 大学英语A1
  tiyu: '2173010001', // 体育(1)
  xingshi: '2211010002', // 形势与政策(1)
  anquan: '1081010001', // 大学生安全教育
  junli: '1071040002', // 军事理论课
  hongloumeng: 'T9000003', // 《红楼梦》与中国文化导论
  junshi: '1071040003', // 军事技能
  xinli: '1071010002', // 大学生心理健康教育
  yingB1: '2161010032', // 大学英语B1
  yuyan: '1131020717', // 语言沟通与表达
  xinxi: '1131020713', // 大学生信息素养——数字资源的检索与利用
  suanfa: '1131040091', // 算法与程序设计实训
  xinlixue: 'T9000005', // 心理学与生活
  yingC1: 'T9000006', // 大学英语C1
  gongchuan: 'T9000007', // 公共传播：从思辨到实践
  shijue: 'T9000004', // 视觉设计入门
  hanzi: 'T9000008', // 假如汉字会说话
  xila: 'T9000009', // 希腊神话与西方艺术
  minghua: 'T9000010', // 中国名画十六讲
  wenming: 'T9000001', // 文明互鉴—西方哲学系列
  renzhineng: 'T9000022', // 人工智能与计量电子影像生成
  chuangyi: 'T9000023', // 创意写作工坊
  gequ: 'T9000024', // 中文歌曲英译英唱
  jilupian: 'T9000025', // 纪录片里的中国
  donghua: 'T9000026', // 从动画案例学到哲学研习：童年
  yanxixianshi: 'T9000027', // 研习建构经典化《现实的中介》
  yanxisanguo: 'T9000028', // 研习经典《三国志▲蜀》
  lixing: 'T9000029', // 可预见的非理性行为
  wangluo: 'T9000030', // 网络文艺概论
  luoji: 'T9000031', // 逻辑思维
}

type CourseDef = { id: string; name: string; credit: number; category: string; required: boolean }

const COURSES: CourseDef[] = [
  { id: g.gaoshu, name: '高等数学（上）', credit: 5, category: '通识教育基础课', required: true },
  { id: g.sixiu, name: '思想道德与法治', credit: 3, category: '通识教育基础课', required: true },
  { id: g.laodong, name: '劳动教育', credit: 1, category: '实践必修环节', required: true },
  { id: g.xisixiang, name: '习近平新时代中国特色社会主义思想概论', credit: 3, category: '通识教育基础课', required: true },
  { id: g.zhigui, name: '大学生职业生涯规划', credit: 1, category: '实践必修环节', required: true },
  { id: g.cpp, name: 'C/C++语言程序设计', credit: 3, category: '通识教育基础课', required: true },
  { id: g.zhinenchuanmei, name: '智能传媒技术导论', credit: 2, category: '通识教育基础课', required: true },
  { id: g.xiandai, name: '线性代数', credit: 3, category: '通识教育基础课', required: true },
  { id: g.tiyu, name: '体育(1)', credit: 1, category: '基础教育课程', required: true },
  { id: g.xingshi, name: '形势与政策(1)', credit: 0.5, category: '通识教育基础课', required: true },
  { id: g.anquan, name: '大学生安全教育', credit: 1, category: '通识教育拓展课', required: false },
  { id: g.junli, name: '军事理论课', credit: 2, category: '实践必修环节', required: true },
  { id: g.junshi, name: '军事技能', credit: 2, category: '实践必修环节', required: true },
  { id: g.xinli, name: '大学生心理健康教育', credit: 2, category: '基础教育课程', required: true },
  { id: g.yingB1, name: '大学英语B1', credit: 4, category: '通识教育基础课', required: true },
  { id: g.yuyan, name: '语言沟通与表达', credit: 2, category: '通识教育核心课', required: false },
  { id: g.xinxi, name: '大学生信息素养——数字资源的检索与利用', credit: 1, category: '通识教育核心课', required: false },
  { id: g.suanfa, name: '算法与程序设计实训', credit: 2, category: '校级实践与创新创业教育选修课', required: false },
  { id: g.wenming, name: '文明互鉴—西方哲学系列', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.yingA1, name: '大学英语A1', credit: 4, category: '通识教育基础课', required: true },
  { id: g.hongloumeng, name: '《红楼梦》与中国文化导论', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.shijue, name: '视觉设计入门', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.xinlixue, name: '心理学与生活', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.yingC1, name: '大学英语C1', credit: 4, category: '通识教育基础课', required: true },
  { id: g.gongchuan, name: '公共传播：从思辨到实践', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.hanzi, name: '假如汉字会说话', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.xila, name: '希腊神话与西方艺术', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.minghua, name: '中国名画十六讲', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.renzhineng, name: '人工智能与计量电子影像生成', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.chuangyi, name: '创意写作工坊', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.gequ, name: '中文歌曲英译英唱', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.jilupian, name: '纪录片里的中国', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.donghua, name: '从动画案例学到哲学研习：童年', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.yanxixianshi, name: '研习建构经典化《现实的中介》', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.yanxisanguo, name: '研习经典《三国志▲蜀》', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.lixing, name: '可预见的非理性行为', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.wangluo, name: '网络文艺概论', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.luoji, name: '逻辑思维', credit: 2, category: '通识教育拓展课', required: false },
]

function mapModule(category: string): { moduleId: number; module: string } {
  if (category.includes('创新创业')) return { moduleId: 5, module: '创新创业与素质拓展模块' }
  if (category.includes('实践')) return { moduleId: 4, module: '实践教学模块' }
  return { moduleId: 1, module: '通识教育模块' }
}

// 公选课（通识教育拓展课/核心课/特色课）只记录分数，不记录学分、不参与绩点
const GONGXUAN_CATEGORIES = new Set(['通识教育拓展课', '通识教育核心课', '通识教育特色课'])

type Score = number | '优' | '良' | '及格'

const STUDENTS: { u: string; n: string; s: [string, Score][] }[] = [
  { u: '202511173001', n: '朱云舒', s: [
    [g.gaoshu, 92], [g.wenming, 93], [g.sixiu, 95], [g.laodong, 98],
    [g.xisixiang, 94], [g.zhigui, 99], [g.cpp, 90], [g.zhinenchuanmei, 95],
    [g.xiandai, 99], [g.yingA1, 90], [g.tiyu, 87], [g.xingshi, 96],
    [g.anquan, 98], [g.junli, 95], [g.hongloumeng, 93], [g.junshi, '良'],
    [g.xinli, 91],
  ]},
  { u: '202511173008', n: '李子阳', s: [
    [g.gaoshu, 91], [g.sixiu, 91], [g.laodong, 96],
    [g.xisixiang, 88], [g.zhigui, 99], [g.cpp, 78], [g.zhinenchuanmei, 99],
    [g.xiandai, 99], [g.tiyu, 90], [g.xingshi, 99],
    [g.anquan, 96], [g.junli, 95], [g.junshi, '良'],
    [g.xinli, 95], [g.yingB1, 93], [g.yuyan, 98], [g.xinxi, 81],
  ]},
  { u: '202511173015', n: '廉宇航', s: [
    [g.gaoshu, 86], [g.wenming, 98], [g.sixiu, 91], [g.laodong, 99],
    [g.xisixiang, 89], [g.zhigui, 99], [g.cpp, 88], [g.zhinenchuanmei, 87],
    [g.xiandai, 100], [g.tiyu, 83], [g.xingshi, 95],
    [g.anquan, 90], [g.junli, 100], [g.junshi, '优'], [g.xinli, 94],
    [g.yingB1, 83], [g.shijue, 95],
  ]},
  { u: '202511173021', n: '黄海芳', s: [
    [g.gaoshu, 73], [g.wenming, 96], [g.sixiu, 90], [g.laodong, 96],
    [g.xisixiang, 86], [g.zhigui, 88], [g.cpp, 87], [g.zhinenchuanmei, 93],
    [g.xiandai, 96], [g.tiyu, 87], [g.xingshi, 96], [g.anquan, 100],
    [g.junli, 95], [g.junshi, '优'], [g.xinli, 91], [g.yingB1, 83],
    [g.renzhineng, 96],
  ]},
  { u: '202511173003', n: '何与航', s: [
    [g.gaoshu, 87], [g.wenming, 94], [g.sixiu, 87], [g.laodong, 100],
    [g.xisixiang, 81], [g.zhigui, 95], [g.cpp, 78], [g.zhinenchuanmei, 98],
    [g.xiandai, 84], [g.tiyu, 92], [g.xingshi, 90],
    [g.anquan, 92], [g.junli, 100], [g.junshi, '良'], [g.xinli, 90],
    [g.yingB1, 90], [g.suanfa, 83], [g.xinlixue, 99],
  ]},
  { u: '202511173010', n: '刘晨曦', s: [
    [g.gaoshu, 88], [g.wenming, 96], [g.sixiu, 88], [g.laodong, 97],
    [g.xisixiang, 83], [g.zhigui, 96], [g.cpp, 74], [g.zhinenchuanmei, 91],
    [g.xiandai, 100], [g.tiyu, 90], [g.xingshi, 95],
    [g.anquan, 98], [g.junli, 95], [g.junshi, '优'], [g.xinli, 88],
    [g.yingB1, 80], [g.yuyan, 94], [g.suanfa, 82],
  ]},
  { u: '202511173017', n: '魏子翔', s: [
    [g.gaoshu, 87], [g.sixiu, 86], [g.laodong, 93],
    [g.xisixiang, 76], [g.zhigui, 98], [g.cpp, 91], [g.zhinenchuanmei, 84],
    [g.xiandai, 99], [g.tiyu, 84], [g.xingshi, 88],
    [g.anquan, 92], [g.junli, 95], [g.junshi, '良'], [g.xinli, 94],
    [g.renzhineng, 97], [g.suanfa, 85], [g.yingC1, 81], [g.gongchuan, 100],
  ]},
  { u: '202511173025', n: '陈宣融', s: [
    [g.gaoshu, 92], [g.sixiu, 90], [g.laodong, 97],
    [g.xisixiang, 79], [g.zhigui, 98], [g.cpp, 79], [g.zhinenchuanmei, 86],
    [g.xiandai, 81], [g.yingA1, 83], [g.tiyu, 82], [g.xingshi, 93],
    [g.anquan, 94], [g.junli, 95], [g.junshi, '良'], [g.xinli, 96],
    [g.chuangyi, 93], [g.gequ, 99],
  ]},
  { u: '202511173016', n: '陶沐杰', s: [
    [g.gaoshu, 89], [g.wenming, 96], [g.sixiu, 82], [g.laodong, 100],
    [g.xisixiang, 76], [g.zhigui, 96], [g.cpp, 79], [g.zhinenchuanmei, 87],
    [g.xiandai, 96], [g.tiyu, 91], [g.xingshi, 90],
    [g.anquan, 94], [g.junli, 100], [g.junshi, '良'], [g.xinli, 91],
    [g.yingB1, 85], [g.luoji, 84],
  ]},
  { u: '202511173011', n: '杨嘉盛', s: [
    [g.gaoshu, 95], [g.sixiu, 89], [g.xisixiang, 85], [g.zhigui, 84],
    [g.cpp, 92], [g.zhinenchuanmei, 85], [g.xiandai, 97], [g.tiyu, 79],
    [g.xingshi, 87], [g.anquan, 96], [g.junli, 94], [g.junshi, '良'],
    [g.xinli, 90], [g.yingB1, 87], [g.luoji, 94],
  ]},
  { u: '202511173005', n: '史莫然', s: [
    [g.gaoshu, 79], [g.wenming, 97], [g.sixiu, 93], [g.laodong, 100],
    [g.xisixiang, 81], [g.zhigui, 99], [g.cpp, 82], [g.zhinenchuanmei, 87],
    [g.xiandai, 90], [g.yingA1, 86], [g.tiyu, 69], [g.xingshi, 88],
    [g.anquan, 94], [g.junli, 100], [g.junshi, '良'], [g.xinli, 96],
    [g.yuyan, 99], [g.suanfa, 81],
  ]},
  { u: '202511173014', n: '康雨乐', s: [
    [g.gaoshu, 87], [g.sixiu, 88], [g.laodong, 100],
    [g.xisixiang, 80], [g.zhigui, 96], [g.cpp, 82], [g.zhinenchuanmei, 91],
    [g.xiandai, 92], [g.tiyu, 73], [g.xingshi, 92],
    [g.anquan, 92], [g.junli, 100], [g.junshi, '良'], [g.xinli, 93],
    [g.yingB1, 80], [g.minghua, 94], [g.yanxixianshi, 90],
  ]},
  { u: '202511173019', n: '米振宇', s: [
    [g.gaoshu, 95], [g.sixiu, 92], [g.xisixiang, 85],
    [g.zhigui, 94], [g.cpp, 84], [g.zhinenchuanmei, 94], [g.xiandai, 95],
    [g.tiyu, 80], [g.xingshi, 89], [g.anquan, 92],
    [g.junli, 68], [g.junshi, '优'], [g.xinli, 95], [g.yingB1, 90],
    [g.yuyan, 95], [g.xinxi, 82], [g.suanfa, 84],
  ]},
  { u: '202511173004', n: '杨梓鑫', s: [
    [g.gaoshu, 73], [g.sixiu, 90], [g.laodong, 96],
    [g.xisixiang, 80], [g.zhigui, 99], [g.cpp, 87], [g.zhinenchuanmei, 87],
    [g.xiandai, 83], [g.yingA1, 84], [g.tiyu, 84], [g.xingshi, 95],
    [g.anquan, 98], [g.junli, 95], [g.junshi, '优'], [g.xinli, 92],
    [g.jilupian, 90], [g.donghua, 81],
  ]},
  { u: '202511173020', n: '邓诗越', s: [
    [g.gaoshu, 81], [g.sixiu, 94], [g.laodong, 93],
    [g.xisixiang, 84], [g.zhigui, 94], [g.cpp, 74], [g.zhinenchuanmei, 87],
    [g.xiandai, 88], [g.tiyu, 78], [g.xingshi, 92],
    [g.anquan, 90], [g.junli, 97], [g.junshi, '良'], [g.xinli, 93],
    [g.yingB1, 87], [g.renzhineng, 97], [g.suanfa, 79], [g.jilupian, 92],
  ]},
  { u: '202511173024', n: '曹林婷', s: [
    [g.gaoshu, 88], [g.wenming, 96], [g.sixiu, 92], [g.laodong, 90],
    [g.xisixiang, 79], [g.zhigui, 96], [g.cpp, 70], [g.zhinenchuanmei, 92],
    [g.xiandai, 72], [g.yingA1, 86], [g.tiyu, 84], [g.xingshi, 98],
    [g.anquan, 96], [g.junli, 95], [g.junshi, '及格'], [g.xinli, 97],
    [g.renzhineng, 97],
  ]},
  { u: '202511173013', n: '张天翔', s: [
    [g.gaoshu, 80], [g.sixiu, 90], [g.xisixiang, 80],
    [g.zhigui, 97], [g.cpp, 79], [g.zhinenchuanmei, 91], [g.xiandai, 87],
    [g.tiyu, 83], [g.xingshi, 87], [g.anquan, 98],
    [g.junli, 97], [g.junshi, '良'], [g.xinli, 90], [g.yingB1, 82],
    [g.luoji, 92],
  ]},
  { u: '202511173006', n: '马庆坤', s: [
    [g.gaoshu, 88], [g.sixiu, 80], [g.laodong, 82],
    [g.xisixiang, 79], [g.zhigui, 71], [g.cpp, 81], [g.zhinenchuanmei, 85],
    [g.xiandai, 79], [g.yingA1, 87], [g.tiyu, 80], [g.xingshi, 92],
    [g.anquan, 94], [g.junli, 99], [g.junshi, '优'], [g.xinli, 85],
    [g.jilupian, 98], [g.hanzi, 96],
  ]},
  { u: '202511173009', n: '王安桥', s: [
    [g.gaoshu, 75], [g.sixiu, 80], [g.xisixiang, 67],
    [g.zhigui, 85], [g.cpp, 83], [g.zhinenchuanmei, 91], [g.xiandai, 85],
    [g.yingA1, 87], [g.tiyu, 89], [g.xingshi, 87],
    [g.anquan, 96], [g.junli, 95], [g.junshi, '优'], [g.xinli, 86],
    [g.yuyan, 90], [g.xinxi, 81],
  ]},
  { u: '202511173007', n: '张凯', s: [
    [g.gaoshu, 91], [g.sixiu, 82], [g.xisixiang, 79],
    [g.zhigui, 88], [g.cpp, 77], [g.zhinenchuanmei, 84], [g.xiandai, 88],
    [g.tiyu, 77], [g.xingshi, 83], [g.anquan, 98],
    [g.junli, 92], [g.junshi, '良'], [g.xinli, 79], [g.yingB1, 82],
    [g.xila, 88], [g.wangluo, 84],
  ]},
  { u: '202511173022', n: '谢佳良', s: [
    [g.gaoshu, 78], [g.sixiu, 81], [g.xisixiang, 76],
    [g.zhigui, 87], [g.cpp, 78], [g.zhinenchuanmei, 84], [g.xiandai, 91],
    [g.tiyu, 77], [g.xingshi, 82], [g.anquan, 94],
    [g.junli, 94], [g.junshi, '优'], [g.xinli, 88], [g.yingB1, 76],
    [g.suanfa, 85], [g.luoji, 84],
  ]},
  { u: '202511173018', n: '李梓鸣', s: [
    [g.gaoshu, 77], [g.sixiu, 83], [g.xisixiang, 77],
    [g.zhigui, 97], [g.cpp, 77], [g.zhinenchuanmei, 81], [g.xiandai, 74],
    [g.tiyu, 76], [g.xingshi, 71], [g.anquan, 94],
    [g.junli, 96], [g.junshi, '良'], [g.xinli, 88], [g.yingB1, 72],
    [g.jilupian, 98], [g.yanxisanguo, 92],
  ]},
  { u: '202511173002', n: '陶知子', s: [
    [g.gaoshu, 80], [g.sixiu, 71], [g.xisixiang, 69],
    [g.zhigui, 82], [g.cpp, 91], [g.zhinenchuanmei, 85], [g.xiandai, 83],
    [g.tiyu, 85], [g.xingshi, 83], [g.junli, 88],
    [g.junshi, '良'], [g.xinli, 86], [g.yingB1, 79], [g.luoji, 83],
  ]},
  { u: '202511173023', n: '朱思谦', s: [
    [g.gaoshu, 63], [g.wenming, 93], [g.sixiu, 81], [g.xisixiang, 70],
    [g.zhigui, 85], [g.cpp, 71], [g.zhinenchuanmei, 90], [g.xiandai, 62],
    [g.yingA1, 80], [g.tiyu, 62], [g.xingshi, 90],
    [g.anquan, 94], [g.junli, 95], [g.junshi, '良'], [g.xinli, 61],
    [g.lixing, 82],
  ]},
]

async function main() {
  // 0. 清理旧的演示课程（ai- 前缀，来自 curriculum-data 的占位数据）及其成绩记录
  await supabase.from('student_courses').delete().like('course_id', 'ai-%')
  await supabase.from('courses').delete().like('id', 'ai-%')

  // 1. 清理本脚本覆盖课程的历史成绩，保证重复执行不残留旧记录（如米振宇旧的「军事理论课」）
  const courseIds = COURSES.map(c => c.id)
  await supabase.from('student_courses').delete().in('course_id', courseIds)

  // 2. 一次性查询全部用户名 → uuid
  const usernames = STUDENTS.map(s => s.u)
  const { data: userRows, error: userErr } = await supabase
    .from('users')
    .select('id, username, name')
    .in('username', usernames)
  if (userErr) {
    console.error('❌ 查询用户失败:', userErr.message)
    process.exit(1)
  }
  const idMap = new Map((userRows ?? []).map(row => [row.username, row.id]))
  const missing = usernames.filter(u => !idMap.has(u))
  if (missing.length) {
    console.error(`❌ 找不到用户（学号）：${missing.join(', ')}`)
    process.exit(1)
  }

  // 3. 写入课程
  const courseRows = COURSES.map(c => {
    const { moduleId, module } = mapModule(c.category)
    return {
      id: c.id,
      name: c.name,
      credit: GONGXUAN_CATEGORIES.has(c.category) ? 0 : c.credit,
      module_id: moduleId,
      module,
      year: 1,
      academic_year: ACADEMIC_YEAR,
      semester: SEMESTER,
      course_attribute: c.required ? '必修' : '选修',
      credit_requirement: c.required ? '必修' : '选修',
      category: c.category,
      suggested_semester: SEMESTER,
      is_core: c.required,
      status: 'completed',
    }
  })
  const { error: courseErr } = await supabase.from('courses').upsert(courseRows)
  if (courseErr) {
    console.error('❌ courses 写入失败:', courseErr.message)
    process.exit(1)
  }
  console.log(`✔ courses: ${courseRows.length} 门`)

  // 4. 写入学生成绩（军事技能为五级制，无分数，记「通过」）
  const scRows: Record<string, unknown>[] = []
  let militaryCount = 0
  for (const student of STUDENTS) {
    const studentId = idMap.get(student.u)!
    for (const [courseId, score] of student.s) {
      if (courseId === g.junshi) {
        militaryCount++
        scRows.push({
          student_id: studentId,
          course_id: courseId,
          status: 'completed',
          regular_score: null,
          final_score: null,
          total_score: null,
          gpa: null,
          exam_status: '通过',
          remediation_status: '无需',
        })
      } else {
        scRows.push({
          student_id: studentId,
          course_id: courseId,
          status: 'completed',
          regular_score: null,
          final_score: null,
          total_score: score,
          gpa: null,
          exam_status: '通过',
          remediation_status: '无需',
        })
      }
    }
  }
  const { error: scErr } = await supabase.from('student_courses').upsert(scRows)
  if (scErr) {
    console.error('❌ student_courses 写入失败:', scErr.message)
    process.exit(1)
  }
  console.log(`✔ student_courses: ${scRows.length} 条（含军事技能 ${militaryCount} 条五级制）`)

  // 5. 汇总
  const total = STUDENTS.reduce((sum, s) => sum + s.s.length, 0)
  console.log(`✅ 完成。${STUDENTS.length} 名同学 / ${total} 门课程成绩（${ACADEMIC_YEAR} ${SEMESTER}）`)
}

main()
