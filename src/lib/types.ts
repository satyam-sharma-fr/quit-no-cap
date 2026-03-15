export type User = {
  id: string
  name: string
  email: string
  image?: string | null
}

export type Habit = {
  id: string
  user_id: string
  name: string
  type: 'quit' | 'build'
  start_date: string
  frequency_goal: string
  cost_per_unit: number
  created_at: string
  total_days: number
  clean_days: number
  today_status: 'clean' | 'slip' | null
}

export type CheckIn = {
  id: string
  habit_id: string
  user_id: string
  date: string
  status: 'clean' | 'slip'
  note: string | null
}

export type Craving = {
  id: string
  habit_id: string
  user_id: string
  intensity: number
  note: string | null
  created_at: string
}

export type BuddyRequest = {
  id: string
  from_user_id: string
  to_user_id: string
  status: string
  created_at: string
  from_name?: string
  from_image?: string | null
}

export type BuddyData = {
  buddy: User | null
  habits: Habit[]
  check_ins: CheckIn[]
  pending_requests: BuddyRequest[]
}
