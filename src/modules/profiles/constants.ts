export type ProfileOption = {
  label: string
  value: string
}

export const PROFILE_GENDER_OPTIONS: ProfileOption[] = [
  { label: '女', value: 'female' },
  { label: '男', value: 'male' },
  { label: '其他', value: 'other' },
  { label: '不方便透露', value: 'prefer_not_to_say' }
]

export const PROFILE_AGE_RANGE_OPTIONS: ProfileOption[] = [
  { label: '18 岁以下', value: 'under_18' },
  { label: '18-25 岁', value: '18_25' },
  { label: '26-35 岁', value: '26_35' },
  { label: '36-45 岁', value: '36_45' },
  { label: '46-60 岁', value: '46_60' },
  { label: '60 岁以上', value: 'over_60' }
]

export const PROFILE_OCCUPATION_OPTIONS: ProfileOption[] = [
  { label: '学生', value: 'student' },
  { label: '教师', value: 'teacher' },
  { label: '医生 / 护士', value: 'medical_worker' },
  { label: '公务员 / 事业单位', value: 'public_service' },
  { label: '互联网 / 科技从业者', value: 'tech_worker' },
  { label: '产品 / 运营', value: 'product_or_operations' },
  { label: '设计 / 创意', value: 'designer' },
  { label: '销售 / 客服', value: 'sales_or_support' },
  { label: '企业管理者', value: 'manager' },
  { label: '自由职业', value: 'freelancer' },
  { label: '家庭照护者', value: 'caregiver' },
  { label: '退休', value: 'retired' },
  { label: '待业 / 求职中', value: 'job_seeker' },
  { label: '其他', value: 'other' }
]

export const PROFILE_ISSUE_TAG_OPTIONS: ProfileOption[] = [
  { label: '失眠', value: 'insomnia' },
  { label: '洁癖', value: 'cleanliness_compulsion' },
  { label: '反复思考', value: 'rumination' },
  { label: '焦虑', value: 'anxiety' },
  { label: '预期焦虑', value: 'anticipatory_anxiety' },
  { label: '强迫思维', value: 'obsessive_thoughts' },
  { label: '强迫行为', value: 'compulsive_behavior' },
  { label: '注意固着', value: 'attention_fixation' },
  { label: '社交紧张', value: 'social_anxiety' },
  { label: '回避行为', value: 'avoidance' },
  { label: '情绪低落', value: 'low_mood' },
  { label: '躯体不适担忧', value: 'somatic_concern' },
  { label: '学习压力', value: 'study_stress' },
  { label: '工作压力', value: 'work_stress' },
  { label: '人际困扰', value: 'relationship_distress' }
]
