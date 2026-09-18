// 导入全班 24 名同学的第二学期（2025-2026 学年 春季 / 大一下）各科成绩
// 数据来源：中国传媒大学 2025 级人工智能（智能视听卓越人才实验班）成绩明细（矫正版）
// 用法：npm run import:semester2
// 幂等：courses 按课程号 upsert，student_courses 按 (student_id, course_id) upsert
// 说明：
//   - 必修课 = 培养方案 63 门课程（含学分），据此写入单科绩点（中传公式）；其余课程一律为选修，绩点填 null（无）
//   - 大学英语分 A2/B2/C2 三个等级，每名同学只修一门（勿与分数混淆）
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { scoreToFourPointGPA } from '../lib/gpa-formula'

dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('请在 .env.local 中配置 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

const ACADEMIC_YEAR = '2025-2026学年'
const SEMESTER = '第二学期'

// 课程号（真实课程号来自成绩单；T9 开头为占位课程号，成绩单/培养方案未提供编号）
const g = {
  // 必修
  wuli: '2131010027', // 大学物理 B
  gailv: '2131010039', // 概率论与数理统计
  gaoshu: '2131010040', // 高等数学（下）A
  yingB2: '2161010033', // 大学英语B2
  yingA2: 'T9000012', // 大学英语A2
  yingC2: 'T9000032', // 大学英语C2
  tiyu: '2173010002', // 体育(2)
  xingshi: '2211010003', // 形势与政策(2)
  mayuan: '2211010024', // 马克思主义基本原理
  laodong: '1311040105', // 劳动教育（第二学期开设，独立课程号，避免与第一学期 1311040104 互相覆盖/误删）
  shuju: '2111010011', // 数据结构与算法
  meiti: '2111040081', // 媒体计算编程基础实践
  suanfa: '2111040085', // 算法应用与实践
  shiyan: '2131010005', // 大学物理实验
  // 选修（原成绩单）
  jiqiren: 'T9000011', // 机器人与人工智能
  gongcheng: '2111040043', // 工程技术思维与创新实践
  jianji: 'T9000013', // 剪辑的历史、理论与实践
  dianzi: 'T9000014', // 电子设计思维
  gaige: '1131021047', // 改革开放简史
  jingong: '2111040031', // 基于金工实训技术的艺术创作训练
  shuzi: 'T9000015', // 人工智能与数字素养
  zhuangzi: 'T9000016', // 庄子哲学
  dianying: 'T9000017', // 电影与精神分析导引
  xinli: 'T9000018', // 心理成长互动体验
  shehui: 'T9000019', // 社会主义发展简史
  yingxiang: 'T9000020', // 影像叙事观念与技巧
  hongguan: 'T9000021', // 宏观经济学
  // 选修（新增公选）
  jingdian: 'T9000033', // 经典音乐赏析
  hanzi2: 'T9000034', // 汉字与历史文化
  xiehou: 'T9000035', // 邂逅交响乐
  zhexuejiangzuo: 'T9000036', // 中国哲学系列讲座
  donghuaxinshang: 'T9000037', // 中国经典动画作品赏析
  luyin: 'T9000038', // 录音艺术与现代传媒
  xinzhongguo: 'T9000039', // 新中国发展与数字化技术
  xinlixue2: 'T9000040', // 心理学与生活（二）
  sishi: 'T9000041', // "四史"融合传播实践
  manhua: 'T9000042', // 漫画艺术赏析与实践
  mingxing: 'T9000043', // 明星文化与社会
  zhuti: 'T9000044', // 主题写作
  xinpian: 'T9000045', // 新片研读
  meijie: 'T9000046', // 媒介考古
  dashuju: 'T9000047', // 大数据与人工智能
  yumaoqiu: 'T9000048', // 羽毛球教学、竞赛与欣赏
  dianyingshenmei: 'T9000049', // 电影与审美文化
  dudongmakesi: 'T9000050', // 读懂马克思
  zhexuezixun: 'T9000051', // 哲学咨询与心灵治疗
  hongloumeng2: 'T9000052', // 《红楼梦》与中国文化导引
  shengchengshiAI: 'T9000053', // 生成式 AI 产品构建与创业者心智模型：理论与硅谷-亚洲实践（全英文）
  renzhinengTensorFlow: 'T9000054', // 人工智能初探-基于 TensorFlow 的实现
  donghuaXinli: 'T9000055', // 动画与心理学
  shijue2: 'T9000056', // 视觉设计入门（二）
  weilaiwangluo: 'T9000057', // 未来网络与媒体传输
  zhexuejingdu: 'T9000058', // 哲学经典讲读
  yishushi: 'T9000059', // 艺术史导论
  chuangxinchuangye: 'T9000060', // 创新创业实践
  jishiyingxiang: 'T9000061', // 纪实影像创作实践
  pipan: 'T9000062', // 批判性思维：AI 时代的提问与会话
  minghua16: 'T9000063', // 中国名画十六讲（二）
}

type CourseDef = { id: string; name: string; credit: number; category: string; required: boolean }

const COURSES: CourseDef[] = [
  // 必修课（培养方案 63 门中的第二学期课程，学分按必修清单）
  { id: g.wuli, name: '大学物理 B', credit: 4, category: '通识教育基础课', required: true },
  { id: g.gailv, name: '概率论与数理统计', credit: 3, category: '通识教育基础课', required: true },
  { id: g.gaoshu, name: '高等数学（下）A', credit: 6, category: '通识教育基础课', required: true },
  { id: g.yingB2, name: '大学英语B2', credit: 4, category: '通识教育基础课', required: true },
  { id: g.yingA2, name: '大学英语A2', credit: 4, category: '通识教育基础课', required: true },
  { id: g.yingC2, name: '大学英语C2', credit: 4, category: '通识教育基础课', required: true },
  { id: g.tiyu, name: '体育(2)', credit: 1, category: '基础教育课程', required: true },
  { id: g.xingshi, name: '形势与政策(2)', credit: 0.5, category: '通识教育基础课', required: true },
  { id: g.mayuan, name: '马克思主义基本原理', credit: 3, category: '通识教育基础课', required: true },
  { id: g.laodong, name: '劳动教育', credit: 1, category: '实践必修环节', required: true },
  { id: g.shuju, name: '数据结构与算法', credit: 3, category: '通识教育基础课', required: true },
  { id: g.meiti, name: '媒体计算编程基础实践', credit: 1, category: '通识教育基础课', required: true },
  { id: g.suanfa, name: '算法应用与实践', credit: 1.5, category: '实践必修环节', required: true },
  { id: g.shiyan, name: '大学物理实验', credit: 0.5, category: '通识教育基础课', required: true },
  // 选修课（不计学分、不计绩点，绩点填「无」）
  { id: g.jiqiren, name: '机器人与人工智能', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.gongcheng, name: '工程技术思维与创新实践', credit: 1, category: '实践选修环节', required: false },
  { id: g.jianji, name: '剪辑的历史、理论与实践', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.dianzi, name: '电子设计思维', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.gaige, name: '改革开放简史', credit: 1, category: '通识教育特色课', required: false },
  { id: g.jingong, name: '基于金工实训技术的艺术创作训练', credit: 2, category: '实践选修环节', required: false },
  { id: g.shuzi, name: '人工智能与数字素养', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.zhuangzi, name: '庄子哲学', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.dianying, name: '电影与精神分析导引', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.xinli, name: '心理成长互动体验', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.shehui, name: '社会主义发展简史', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.yingxiang, name: '影像叙事观念与技巧', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.hongguan, name: '宏观经济学', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.jingdian, name: '经典音乐赏析', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.hanzi2, name: '汉字与历史文化', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.xiehou, name: '邂逅交响乐', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.zhexuejiangzuo, name: '中国哲学系列讲座', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.donghuaxinshang, name: '中国经典动画作品赏析', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.luyin, name: '录音艺术与现代传媒', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.xinzhongguo, name: '新中国发展与数字化技术', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.xinlixue2, name: '心理学与生活（二）', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.sishi, name: '"四史"融合传播实践', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.manhua, name: '漫画艺术赏析与实践', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.mingxing, name: '明星文化与社会', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.zhuti, name: '主题写作', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.xinpian, name: '新片研读', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.meijie, name: '媒介考古', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.dashuju, name: '大数据与人工智能', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.yumaoqiu, name: '羽毛球教学、竞赛与欣赏', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.dianyingshenmei, name: '电影与审美文化', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.dudongmakesi, name: '读懂马克思', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.zhexuezixun, name: '哲学咨询与心灵治疗', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.hongloumeng2, name: '《红楼梦》与中国文化导引', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.shengchengshiAI, name: '生成式 AI 产品构建与创业者心智模型：理论与硅谷-亚洲实践（全英文）', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.renzhinengTensorFlow, name: '人工智能初探-基于 TensorFlow 的实现', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.donghuaXinli, name: '动画与心理学', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.shijue2, name: '视觉设计入门（二）', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.weilaiwangluo, name: '未来网络与媒体传输', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.zhexuejingdu, name: '哲学经典讲读', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.yishushi, name: '艺术史导论', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.chuangxinchuangye, name: '创新创业实践', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.jishiyingxiang, name: '纪实影像创作实践', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.pipan, name: '批判性思维：AI 时代的提问与会话', credit: 2, category: '通识教育拓展课', required: false },
  { id: g.minghua16, name: '中国名画十六讲（二）', credit: 2, category: '通识教育拓展课', required: false },
]

function mapModule(category: string): { moduleId: number; module: string } {
  if (category.includes('创新创业')) return { moduleId: 5, module: '创新创业与素质拓展模块' }
  if (category.includes('实践')) return { moduleId: 4, module: '实践教学模块' }
  return { moduleId: 1, module: '通识教育模块' }
}

const STUDENTS: { u: string; n: string; s: [string, number][] }[] = [
  { u: '202511173011', n: '杨嘉盛', s: [
    [g.wuli, 93], [g.gailv, 93], [g.gaoshu, 99], [g.yingB2, 92], [g.tiyu, 88],
    [g.xingshi, 88], [g.mayuan, 80], [g.jiqiren, 93], [g.laodong, 98], [g.shuju, 92],
    [g.gongcheng, 88], [g.meiti, 95], [g.suanfa, 97], [g.shiyan, 93],
  ]},
  { u: '202511173017', n: '魏子翔', s: [
    [g.wuli, 93], [g.gailv, 95], [g.gaoshu, 96], [g.tiyu, 88], [g.xingshi, 98],
    [g.mayuan, 91], [g.shuju, 90], [g.gongcheng, 92], [g.meiti, 95], [g.suanfa, 96],
    [g.shiyan, 88], [g.jianji, 94], [g.dianzi, 89], [g.yingC2, 79],
  ]},
  { u: '202511173008', n: '李子阳', s: [
    [g.wuli, 80], [g.gailv, 78], [g.gaoshu, 97], [g.yingB2, 90], [g.tiyu, 93],
    [g.xingshi, 98], [g.mayuan, 95], [g.shuju, 87], [g.gongcheng, 88], [g.meiti, 90],
    [g.suanfa, 85], [g.shiyan, 97], [g.dianzi, 88], [g.gaige, 97], [g.jingong, 90],
    [g.shuzi, 92],
  ]},
  { u: '202511173001', n: '朱云舒', s: [
    [g.wuli, 80], [g.gailv, 88], [g.gaoshu, 93], [g.tiyu, 91], [g.xingshi, 98],
    [g.mayuan, 93], [g.shuju, 91], [g.gongcheng, 90], [g.meiti, 91], [g.suanfa, 77],
    [g.shiyan, 96], [g.yingA2, 91], [g.zhuangzi, 94], [g.dianying, 90],
  ]},
  { u: '202511173003', n: '何与航', s: [
    [g.wuli, 86], [g.gailv, 82], [g.gaoshu, 77], [g.yingB2, 88], [g.tiyu, 85],
    [g.xingshi, 94], [g.mayuan, 82], [g.shuju, 86], [g.gongcheng, 95], [g.meiti, 85],
    [g.suanfa, 100], [g.shiyan, 97], [g.xinli, 95], [g.jingdian, 97],
  ]},
  { u: '202511173019', n: '米振宇', s: [
    [g.wuli, 86], [g.gailv, 90], [g.gaoshu, 98], [g.yingB2, 88], [g.tiyu, 93],
    [g.xingshi, 90], [g.mayuan, 83], [g.laodong, 86], [g.shuju, 80], [g.gongcheng, 90],
    [g.meiti, 90], [g.suanfa, 87], [g.shiyan, 94], [g.gaige, 80], [g.hanzi2, 94],
    [g.xiehou, 96],
  ]},
  { u: '202511173015', n: '廉宇航', s: [
    [g.wuli, 81], [g.gailv, 75], [g.gaoshu, 83], [g.yingB2, 84], [g.tiyu, 86],
    [g.xingshi, 96], [g.mayuan, 94], [g.shuju, 84], [g.gongcheng, 89], [g.meiti, 82],
    [g.suanfa, 92], [g.shiyan, 92], [g.gaige, 100], [g.zhexuejiangzuo, 93], [g.minghua16, 91],
  ]},
  { u: '202511173016', n: '陶沐杰', s: [
    [g.wuli, 83], [g.gailv, 79], [g.gaoshu, 92], [g.yingB2, 77], [g.tiyu, 88],
    [g.xingshi, 96], [g.mayuan, 77], [g.shuju, 83], [g.gongcheng, 91], [g.meiti, 92],
    [g.suanfa, 91], [g.shiyan, 96], [g.zhexuejiangzuo, 96], [g.donghuaxinshang, 88],
  ]},
  { u: '202511173020', n: '邓诗越', s: [
    [g.wuli, 81], [g.gailv, 81], [g.gaoshu, 92], [g.yingB2, 84], [g.tiyu, 90],
    [g.xingshi, 95], [g.mayuan, 86], [g.shuju, 84], [g.gongcheng, 93], [g.meiti, 91],
    [g.suanfa, 86], [g.shiyan, 88], [g.jianji, 91], [g.luyin, 88], [g.xinzhongguo, 85],
  ]},
  { u: '202511173021', n: '黄海芳', s: [
    [g.wuli, 73], [g.gailv, 76], [g.gaoshu, 78], [g.yingB2, 80], [g.tiyu, 91],
    [g.xingshi, 95], [g.mayuan, 91], [g.shuju, 85], [g.gongcheng, 90], [g.meiti, 94],
    [g.suanfa, 94], [g.shiyan, 92], [g.xinlixue2, 98], [g.sishi, 82], [g.manhua, 95],
  ]},
  { u: '202511173005', n: '史莫然', s: [
    [g.wuli, 86], [g.gailv, 85], [g.gaoshu, 87], [g.tiyu, 83], [g.xingshi, 95],
    [g.mayuan, 85], [g.shuju, 85], [g.gongcheng, 90], [g.meiti, 81], [g.suanfa, 80],
    [g.shiyan, 87], [g.yingA2, 87], [g.minghua16, 92], [g.mingxing, 88],
  ]},
  { u: '202511173010', n: '刘晨曦', s: [
    [g.wuli, 69], [g.gailv, 71], [g.gaoshu, 90], [g.yingB2, 81], [g.tiyu, 91],
    [g.xingshi, 94], [g.mayuan, 92], [g.shuju, 83], [g.gongcheng, 90], [g.meiti, 82],
    [g.suanfa, 84], [g.shiyan, 95], [g.zhuti, 92], [g.xinpian, 97],
  ]},
  { u: '202511173006', n: '马庆坤', s: [
    [g.wuli, 74], [g.gailv, 75], [g.gaoshu, 75], [g.tiyu, 88], [g.xingshi, 96],
    [g.mayuan, 71], [g.shuju, 88], [g.gongcheng, 90], [g.meiti, 81], [g.suanfa, 92],
    [g.shiyan, 98], [g.yingA2, 84], [g.xiehou, 97], [g.meijie, 84], [g.dashuju, 94],
  ]},
  { u: '202511173014', n: '康雨乐', s: [
    [g.wuli, 67], [g.gailv, 76], [g.gaoshu, 82], [g.yingB2, 80], [g.tiyu, 93],
    [g.xingshi, 96], [g.mayuan, 86], [g.shuju, 84], [g.gongcheng, 90], [g.meiti, 85],
    [g.suanfa, 71], [g.shiyan, 90], [g.yumaoqiu, 97], [g.dianyingshenmei, 94], [g.dudongmakesi, 90],
  ]},
  { u: '202511173024', n: '曹林婷', s: [
    [g.wuli, 63], [g.gailv, 76], [g.gaoshu, 87], [g.tiyu, 91], [g.xingshi, 94],
    [g.mayuan, 85], [g.shuju, 77], [g.gongcheng, 90], [g.meiti, 86], [g.suanfa, 71],
    [g.shiyan, 96], [g.yingA2, 87], [g.zhexuezixun, 95], [g.hongloumeng2, 90], [g.shengchengshiAI, 88],
  ]},
  { u: '202511173002', n: '陶知子', s: [
    [g.wuli, 76], [g.gailv, 78], [g.gaoshu, 94], [g.yingB2, 72], [g.tiyu, 80],
    [g.xingshi, 84], [g.mayuan, 74], [g.laodong, 82], [g.shuju, 91], [g.gongcheng, 85],
    [g.meiti, 95], [g.suanfa, 100], [g.shiyan, 92], [g.renzhinengTensorFlow, 84],
  ]},
  { u: '202511173004', n: '杨梓鑫', s: [
    [g.wuli, 63], [g.gailv, 68], [g.gaoshu, 78], [g.tiyu, 87], [g.xingshi, 97],
    [g.mayuan, 89], [g.shuju, 80], [g.gongcheng, 85], [g.meiti, 86], [g.suanfa, 70],
    [g.shiyan, 92], [g.gaige, 97], [g.yingA2, 80], [g.zhexuejiangzuo, 95], [g.donghuaXinli, 94],
  ]},
  { u: '202511173022', n: '谢佳良', s: [
    [g.wuli, 72], [g.gailv, 70], [g.gaoshu, 68], [g.yingB2, 81], [g.tiyu, 90],
    [g.xingshi, 86], [g.mayuan, 81], [g.laodong, 87], [g.shuju, 83], [g.gongcheng, 91],
    [g.meiti, 85], [g.suanfa, 94], [g.shiyan, 90], [g.renzhinengTensorFlow, 93], [g.shijue2, 90],
  ]},
  { u: '202511173025', n: '陈宣融', s: [
    [g.wuli, 70], [g.gailv, 64], [g.gaoshu, 80], [g.tiyu, 77], [g.xingshi, 94],
    [g.mayuan, 88], [g.shuju, 80], [g.gongcheng, 90], [g.meiti, 92], [g.suanfa, 67],
    [g.shiyan, 96], [g.yingA2, 82], [g.luyin, 90], [g.weilaiwangluo, 90], [g.zhexuejingdu, 90],
  ]},
  { u: '202511173018', n: '李梓鸣', s: [
    [g.wuli, 66], [g.gailv, 79], [g.gaoshu, 81], [g.yingB2, 77], [g.tiyu, 90],
    [g.xingshi, 64], [g.mayuan, 79], [g.shuju, 85], [g.gongcheng, 85], [g.meiti, 85],
    [g.suanfa, 100], [g.shiyan, 88], [g.meijie, 91], [g.zhexuejingdu, 80], [g.yishushi, 96],
  ]},
  { u: '202511173007', n: '张凯', s: [
    [g.wuli, 87], [g.gailv, 60], [g.gaoshu, 86], [g.yingB2, 78], [g.tiyu, 79],
    [g.xingshi, 81], [g.mayuan, 77], [g.laodong, 82], [g.shuju, 84], [g.gongcheng, 85],
    [g.meiti, 77], [g.suanfa, 92], [g.shiyan, 89], [g.xiehou, 92], [g.yumaoqiu, 97],
  ]},
  { u: '202511173023', n: '朱思谦', s: [
    [g.wuli, 60], [g.gailv, 60], [g.gaoshu, 71], [g.tiyu, 86], [g.xingshi, 92],
    [g.mayuan, 72], [g.laodong, 95], [g.shuju, 84], [g.gongcheng, 91], [g.meiti, 88],
    [g.suanfa, 72], [g.shiyan, 80], [g.yingA2, 81], [g.shengchengshiAI, 91], [g.chuangxinchuangye, 89],
    [g.jishiyingxiang, 83], [g.pipan, 93], [g.shehui, 99], [g.yingxiang, 95], [g.hongguan, 74],
  ]},
  { u: '202511173013', n: '张天翔', s: [
    [g.wuli, 80], [g.gailv, 70], [g.gaoshu, 65], [g.yingB2, 76], [g.tiyu, 90],
    [g.xingshi, 87], [g.mayuan, 86], [g.laodong, 84], [g.shuju, 85], [g.gongcheng, 86],
    [g.meiti, 80], [g.suanfa, 86], [g.shiyan, 88], [g.renzhinengTensorFlow, 93],
  ]},
  { u: '202511173009', n: '王安桥', s: [
    [g.wuli, 63], [g.gailv, 71], [g.gaoshu, 73], [g.tiyu, 85], [g.xingshi, 91],
    [g.mayuan, 80], [g.laodong, 85], [g.shuju, 83], [g.gongcheng, 85], [g.meiti, 82],
    [g.suanfa, 89], [g.shiyan, 90], [g.yingA2, 82],
  ]},
]

async function main() {
  // 1. 清理本脚本覆盖课程的历史成绩（保证重复执行不残留旧记录）
  const courseIds = COURSES.map(c => c.id)
  const { error: delErr } = await supabase.from('student_courses').delete().in('course_id', courseIds)
  if (delErr) {
    console.error('❌ 清理历史成绩失败:', delErr.message)
    process.exit(1)
  }

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

  // 3. 写入课程（必修 = required，credit 按必修清单；选修 credit=0、不计绩点）
  const courseRows = COURSES.map(c => {
    const { moduleId, module } = mapModule(c.category)
    return {
      id: c.id,
      name: c.name,
      credit: c.required ? c.credit : 0,
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

  // 4. 写入学生成绩（必修课按中传公式写入单科绩点，选修课绩点填 null）
  const requiredById = new Map(COURSES.map(c => [c.id, c.required]))
  const scRows: Record<string, unknown>[] = []
  for (const student of STUDENTS) {
    const studentId = idMap.get(student.u)!
    for (const [courseId, score] of student.s) {
      scRows.push({
        student_id: studentId,
        course_id: courseId,
        status: 'completed',
        regular_score: null,
        final_score: null,
        total_score: score,
        gpa: requiredById.get(courseId) ? scoreToFourPointGPA(score) : null,
        exam_status: '通过',
        remediation_status: '无需',
      })
    }
  }
  const { error: scErr } = await supabase.from('student_courses').upsert(scRows)
  if (scErr) {
    console.error('❌ student_courses 写入失败:', scErr.message)
    process.exit(1)
  }
  console.log(`✔ student_courses: ${scRows.length} 条`)

  // 5. 汇总
  const total = STUDENTS.reduce((sum, s) => sum + s.s.length, 0)
  console.log(`✅ 完成。${STUDENTS.length} 名同学 / ${total} 门课程成绩（${ACADEMIC_YEAR} ${SEMESTER}）`)
}

main()
