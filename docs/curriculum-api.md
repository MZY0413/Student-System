# 课程培养方案进度一览接口定义

## 1. 获取人工智能专业培养方案

`GET /api/curriculum/ai-major`

返回中国传媒大学人工智能本科专业培养方案课程体系，数据源对应 `ai_major_curriculum` 表。

### Response

```json
{
  "major": "人工智能",
  "modules": [
    {
      "moduleId": 1,
      "moduleName": "通识教育模块",
      "requiredCredits": 48,
      "electiveCredits": 12,
      "courses": [
        {
          "courseId": "ai-001",
          "courseName": "思想道德修养与法律基础",
          "moduleId": 1,
          "moduleName": "通识教育模块",
          "courseAttribute": "必修",
          "credit": 3,
          "suggestedSemester": "1",
          "isCore": true
        }
      ]
    }
  ]
}
```

## 2. 获取学生培养方案进度

`GET /api/students/{studentId}/curriculum-progress`

### Query

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `attribute` | string | 否 | `必修`、`选修`，默认全部 |
| `status` | string | 否 | `passed`、`studying`、`notStarted`、`retaking`，默认全部 |
| `semester` | string | 否 | 建议修读学期，如 `1`、`1-8`，默认全部 |

### Response

```json
{
  "major": "人工智能",
  "currentGrade": "大二",
  "expectedPercent": 50,
  "totalRequiredCredits": 185,
  "totalCompletedCredits": 96,
  "totalPercent": 52,
  "remainingRequiredCredits": 77,
  "remainingElectiveCredits": 12,
  "graduationStatus": "存在风险",
  "modules": [
    {
      "moduleId": 1,
      "name": "通识教育模块",
      "requiredCredits": 60,
      "completedCredits": 50,
      "percent": 83,
      "required": {
        "courseAttribute": "必修",
        "requiredCredits": 48,
        "completedCredits": 43,
        "percent": 90,
        "isInsufficient": true
      },
      "elective": {
        "courseAttribute": "选修",
        "requiredCredits": 12,
        "completedCredits": 7,
        "percent": 58,
        "isInsufficient": true
      },
      "statusCredits": {
        "passed": 50,
        "studying": 4,
        "notStarted": 6,
        "retaking": 0
      },
      "courses": [
        {
          "courseId": "ai-001",
          "courseName": "思想道德修养与法律基础",
          "moduleId": 1,
          "module": "通识教育模块",
          "courseAttribute": "必修",
          "credit": 3,
          "suggestedSemester": "1",
          "isCore": true,
          "status": "passed",
          "totalScore": 88,
          "examStatus": "通过",
          "remediationStatus": "无需"
        }
      ]
    }
  ],
  "warnings": [
    {
      "id": "required-failed-ai-030",
      "type": "requiredMissing",
      "level": "red",
      "message": "模式识别 为必修课且未通过，请尽快重修或补考。"
    }
  ]
}
```

## 3. 导出个人培养方案进度表

`GET /api/students/{studentId}/curriculum-progress/export`

### Query

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `format` | string | 否 | 固定为 `pdf`，默认 `pdf` |

### Response

返回 `application/pdf` 文件流。文件内容包含顶部总学分进度、五大模块进度、课程明细和智能预警事项。

## 核算规则

- 已修学分只统计 `examStatus=通过` 且 `totalScore>=60` 的课程。
- `completedCredits = min(必修通过学分, 模块必修要求) + min(选修通过学分, 模块选修要求)`。
- 总毕业要求学分为 185，其中必修 145，选修 40。
- 红色预警包含必修未通过、毕业学分不足、大四实践或毕业设计未完成。
- 黄色预警包含当前学期应修未修、选修学分不足、实际进度落后当前年级应完成进度。
