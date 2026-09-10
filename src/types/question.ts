export type QuestionStatus = 'pending' | 'answered' | 'dismissed';

export interface Question {
  id: string;
  question_text: string;
  answer_text: string | null;
  status: QuestionStatus;
  is_anonymous: boolean;
  asker_name: string;
  likes_count: number;
  parent_id?: string | null;
  parent_question_text?: string | null;
  created_at: string;
  answered_at: string | null;
}

export interface ProfileBio {
  alias_ar: string;
  alias_en: string;
  name_ar: string;
  name_en: string;
  bio_ar: string;
  bio_en: string;
  linkedin: string;
  github: string;
}

export interface QuestionSubmission {
  question_text: string;
  asker_name?: string;
  is_anonymous?: boolean;
  parent_id?: string | null;
}

export interface FeedStats {
  total_answered: number;
  total_likes: number;
  total_pending?: number;
}
