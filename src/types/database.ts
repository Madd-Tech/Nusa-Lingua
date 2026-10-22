/**
 * Tipe database Supabase.
 *
 * File ini mengikuti format keluaran `supabase gen types typescript`.
 * Regenerasi dari skema asli dengan:
 *   npm run gen:types   (butuh SUPABASE_PROJECT_ID & `supabase login`)
 *
 * Catatan: tipe di bawah ditulis mengikuti skema di brief (id konten = bigint → number,
 * id pengguna & chat_sessions = uuid → string). Jika hasil generate berbeda, cukup
 * timpa file ini — semua query di src/lib/queries memakai tipe dari sini.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      regions: {
        Row: {
          id: number;
          name: string;
          province: string | null;
          island: string | null;
          lat: number | null;
          lng: number | null;
          image_url: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          province?: string | null;
          island?: string | null;
          lat?: number | null;
          lng?: number | null;
          image_url?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          province?: string | null;
          island?: string | null;
          lat?: number | null;
          lng?: number | null;
          image_url?: string | null;
        };
        Relationships: [];
      };
      languages: {
        Row: {
          id: number;
          region_id: number | null;
          name: string;
          code: string;
          description: string | null;
          icon_url: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: number;
          region_id?: number | null;
          name: string;
          code: string;
          description?: string | null;
          icon_url?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: number;
          region_id?: number | null;
          name?: string;
          code?: string;
          description?: string | null;
          icon_url?: string | null;
          is_active?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "languages_region_id_fkey";
            columns: ["region_id"];
            isOneToOne: false;
            referencedRelation: "regions";
            referencedColumns: ["id"];
          },
        ];
      };
      units: {
        Row: {
          id: number;
          language_id: number;
          title: string;
          description: string | null;
          level: Database["public"]["Enums"]["unit_level"];
          order_index: number;
        };
        Insert: {
          id?: number;
          language_id: number;
          title: string;
          description?: string | null;
          level?: Database["public"]["Enums"]["unit_level"];
          order_index?: number;
        };
        Update: {
          id?: number;
          language_id?: number;
          title?: string;
          description?: string | null;
          level?: Database["public"]["Enums"]["unit_level"];
          order_index?: number;
        };
        Relationships: [
          {
            foreignKeyName: "units_language_id_fkey";
            columns: ["language_id"];
            isOneToOne: false;
            referencedRelation: "languages";
            referencedColumns: ["id"];
          },
        ];
      };
      lessons: {
        Row: {
          id: number;
          unit_id: number;
          title: string;
          order_index: number;
          xp_reward: number;
        };
        Insert: {
          id?: number;
          unit_id: number;
          title: string;
          order_index?: number;
          xp_reward?: number;
        };
        Update: {
          id?: number;
          unit_id?: number;
          title?: string;
          order_index?: number;
          xp_reward?: number;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_unit_id_fkey";
            columns: ["unit_id"];
            isOneToOne: false;
            referencedRelation: "units";
            referencedColumns: ["id"];
          },
        ];
      };
      vocabularies: {
        Row: {
          id: number;
          language_id: number;
          word: string;
          meaning_id: string;
          speech_level: string | null;
          pronunciation: string | null;
          audio_url: string | null;
          image_url: string | null;
          example_sentence: string | null;
          category: string | null;
          meaning_en: string | null;
          example_meaning: string | null;
          peran: string;
          source: string | null;
          contributed_by: string | null;
        };
        Insert: {
          id?: number;
          language_id: number;
          word: string;
          meaning_id: string;
          speech_level?: string | null;
          pronunciation?: string | null;
          audio_url?: string | null;
          image_url?: string | null;
          example_sentence?: string | null;
          category?: string | null;
          meaning_en?: string | null;
          example_meaning?: string | null;
          peran?: string;
          source?: string | null;
          contributed_by?: string | null;
        };
        Update: {
          id?: number;
          language_id?: number;
          word?: string;
          meaning_id?: string;
          speech_level?: string | null;
          pronunciation?: string | null;
          audio_url?: string | null;
          image_url?: string | null;
          example_sentence?: string | null;
          category?: string | null;
          meaning_en?: string | null;
          example_meaning?: string | null;
          peran?: string;
          source?: string | null;
          contributed_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "vocabularies_contributed_by_fkey";
            columns: ["contributed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vocabularies_language_id_fkey";
            columns: ["language_id"];
            isOneToOne: false;
            referencedRelation: "languages";
            referencedColumns: ["id"];
          },
        ];
      };
      questions: {
        Row: {
          id: number;
          lesson_id: number;
          vocabulary_id: number | null;
          type: Database["public"]["Enums"]["question_type"];
          prompt: string;
          options: Json | null;
          correct_answer: string;
          audio_url: string | null;
          order_index: number;
        };
        Insert: {
          id?: number;
          lesson_id: number;
          vocabulary_id?: number | null;
          type: Database["public"]["Enums"]["question_type"];
          prompt: string;
          options?: Json | null;
          correct_answer: string;
          audio_url?: string | null;
          order_index?: number;
        };
        Update: {
          id?: number;
          lesson_id?: number;
          vocabulary_id?: number | null;
          type?: Database["public"]["Enums"]["question_type"];
          prompt?: string;
          options?: Json | null;
          correct_answer?: string;
          audio_url?: string | null;
          order_index?: number;
        };
        Relationships: [
          {
            foreignKeyName: "questions_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "questions_vocabulary_id_fkey";
            columns: ["vocabulary_id"];
            isOneToOne: false;
            referencedRelation: "vocabularies";
            referencedColumns: ["id"];
          },
        ];
      };
      achievements: {
        Row: {
          id: number;
          code: string;
          name: string;
          description: string | null;
          icon_url: string | null;
          condition: Json | null;
        };
        Insert: {
          id?: number;
          code: string;
          name: string;
          description?: string | null;
          icon_url?: string | null;
          condition?: Json | null;
        };
        Update: {
          id?: number;
          code?: string;
          name?: string;
          description?: string | null;
          icon_url?: string | null;
          condition?: Json | null;
        };
        Relationships: [];
      };
      cultural_articles: {
        Row: {
          id: number;
          region_id: number | null;
          language_id: number | null;
          title: string;
          slug: string;
          category: Database["public"]["Enums"]["article_category"];
          summary: string | null;
          content: string;
          cover_url: string | null;
          /** Kolom turunan: status = 'published'. */
          is_published: boolean;
          status: Database["public"]["Enums"]["article_status"];
          author_id: string | null;
          sources: string | null;
          review_note: string | null;
          created_at: string;
          updated_at: string | null;
          updated_by: string | null;
          published_at: string | null;
          published_by: string | null;
        };
        Insert: {
          id?: number;
          region_id?: number | null;
          language_id?: number | null;
          title: string;
          slug: string;
          category?: Database["public"]["Enums"]["article_category"];
          summary?: string | null;
          content?: string;
          cover_url?: string | null;
          is_published?: never;
          status?: Database["public"]["Enums"]["article_status"];
          author_id?: string | null;
          sources?: string | null;
          review_note?: string | null;
          created_at?: string;
          updated_at?: string | null;
          updated_by?: string | null;
          published_at?: string | null;
          published_by?: string | null;
        };
        Update: {
          id?: number;
          region_id?: number | null;
          language_id?: number | null;
          title?: string;
          slug?: string;
          category?: Database["public"]["Enums"]["article_category"];
          summary?: string | null;
          content?: string;
          cover_url?: string | null;
          is_published?: never;
          status?: Database["public"]["Enums"]["article_status"];
          author_id?: string | null;
          sources?: string | null;
          review_note?: string | null;
          created_at?: string;
          updated_at?: string | null;
          updated_by?: string | null;
          published_at?: string | null;
          published_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "cultural_articles_region_id_fkey";
            columns: ["region_id"];
            isOneToOne: false;
            referencedRelation: "regions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cultural_articles_language_id_fkey";
            columns: ["language_id"];
            isOneToOne: false;
            referencedRelation: "languages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cultural_articles_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cultural_articles_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cultural_articles_published_by_fkey";
            columns: ["published_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          home_region_id: number | null;
          xp_total: number;
          current_streak: number;
          longest_streak: number;
          last_active_date: string | null;
          hearts: number;
          role: Database["public"]["Enums"]["user_role"];
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          home_region_id?: number | null;
          xp_total?: number;
          current_streak?: number;
          longest_streak?: number;
          last_active_date?: string | null;
          hearts?: number;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          home_region_id?: number | null;
          xp_total?: number;
          current_streak?: number;
          longest_streak?: number;
          last_active_date?: string | null;
          hearts?: number;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_home_region_id_fkey";
            columns: ["home_region_id"];
            isOneToOne: false;
            referencedRelation: "regions";
            referencedColumns: ["id"];
          },
        ];
      };
      user_languages: {
        Row: {
          user_id: string;
          language_id: number;
          xp: number;
          started_at: string;
        };
        Insert: {
          user_id: string;
          language_id: number;
          xp?: number;
          started_at?: string;
        };
        Update: {
          user_id?: string;
          language_id?: number;
          xp?: number;
          started_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_languages_language_id_fkey";
            columns: ["language_id"];
            isOneToOne: false;
            referencedRelation: "languages";
            referencedColumns: ["id"];
          },
        ];
      };
      user_lesson_progress: {
        Row: {
          user_id: string;
          lesson_id: number;
          status: Database["public"]["Enums"]["lesson_status"];
          best_score: number;
          stars: number;
          attempts: number;
          completed_at: string | null;
        };
        Insert: {
          user_id: string;
          lesson_id: number;
          status?: Database["public"]["Enums"]["lesson_status"];
          best_score?: number;
          stars?: number;
          attempts?: number;
          completed_at?: string | null;
        };
        Update: {
          user_id?: string;
          lesson_id?: number;
          status?: Database["public"]["Enums"]["lesson_status"];
          best_score?: number;
          stars?: number;
          attempts?: number;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      user_vocab_mastery: {
        Row: {
          user_id: string;
          vocabulary_id: number;
          strength: number;
          correct_count: number;
          wrong_count: number;
          next_review_at: string | null;
        };
        Insert: {
          user_id: string;
          vocabulary_id: number;
          strength?: number;
          correct_count?: number;
          wrong_count?: number;
          next_review_at?: string | null;
        };
        Update: {
          user_id?: string;
          vocabulary_id?: number;
          strength?: number;
          correct_count?: number;
          wrong_count?: number;
          next_review_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_vocab_mastery_vocabulary_id_fkey";
            columns: ["vocabulary_id"];
            isOneToOne: false;
            referencedRelation: "vocabularies";
            referencedColumns: ["id"];
          },
        ];
      };
      xp_logs: {
        Row: {
          id: number;
          user_id: string;
          amount: number;
          source: string;
          source_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          amount: number;
          source: string;
          source_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          amount?: number;
          source?: string;
          source_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_achievements: {
        Row: {
          user_id: string;
          achievement_id: number;
          earned_at: string;
        };
        Insert: {
          user_id: string;
          achievement_id: number;
          earned_at?: string;
        };
        Update: {
          user_id?: string;
          achievement_id?: number;
          earned_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey";
            columns: ["achievement_id"];
            isOneToOne: false;
            referencedRelation: "achievements";
            referencedColumns: ["id"];
          },
        ];
      };
      user_article_reads: {
        Row: {
          user_id: string;
          article_id: number;
          read_at: string;
        };
        Insert: {
          user_id: string;
          article_id: number;
          read_at?: string;
        };
        Update: {
          user_id?: string;
          article_id?: number;
          read_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_article_reads_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: false;
            referencedRelation: "cultural_articles";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_personas: {
        Row: {
          id: number;
          language_id: number | null;
          name: string;
          description: string | null;
          avatar_url: string | null;
          system_prompt: string;
        };
        Insert: {
          id?: number;
          language_id?: number | null;
          name: string;
          description?: string | null;
          avatar_url?: string | null;
          system_prompt: string;
        };
        Update: {
          id?: number;
          language_id?: number | null;
          name?: string;
          description?: string | null;
          avatar_url?: string | null;
          system_prompt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_personas_language_id_fkey";
            columns: ["language_id"];
            isOneToOne: false;
            referencedRelation: "languages";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          persona_id: number;
          title: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          persona_id: number;
          title?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          persona_id?: number;
          title?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_sessions_persona_id_fkey";
            columns: ["persona_id"];
            isOneToOne: false;
            referencedRelation: "ai_personas";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_messages: {
        Row: {
          id: number;
          session_id: string;
          role: Database["public"]["Enums"]["chat_role"];
          content: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          session_id: string;
          role: Database["public"]["Enums"]["chat_role"];
          content: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          session_id?: string;
          role?: Database["public"]["Enums"]["chat_role"];
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "chat_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      vocab_submissions: {
        Row: {
          id: number;
          user_id: string;
          language_id: number;
          word: string;
          meaning_id: string;
          audio_url: string | null;
          status: Database["public"]["Enums"]["submission_status"];
          reviewed_by: string | null;
          created_at: string;
          reject_reason: Database["public"]["Enums"]["reject_reason"] | null;
          review_note: string | null;
          reviewed_at: string | null;
          original: Json | null;
          vocabulary_id: number | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          language_id: number;
          word: string;
          meaning_id: string;
          audio_url?: string | null;
          status?: Database["public"]["Enums"]["submission_status"];
          reviewed_by?: string | null;
          created_at?: string;
          reject_reason?: Database["public"]["Enums"]["reject_reason"] | null;
          review_note?: string | null;
          reviewed_at?: string | null;
          original?: Json | null;
          vocabulary_id?: number | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          language_id?: number;
          word?: string;
          meaning_id?: string;
          audio_url?: string | null;
          status?: Database["public"]["Enums"]["submission_status"];
          reviewed_by?: string | null;
          created_at?: string;
          reject_reason?: Database["public"]["Enums"]["reject_reason"] | null;
          review_note?: string | null;
          reviewed_at?: string | null;
          original?: Json | null;
          vocabulary_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "vocab_submissions_language_id_fkey";
            columns: ["language_id"];
            isOneToOne: false;
            referencedRelation: "languages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vocab_submissions_vocabulary_id_fkey";
            columns: ["vocabulary_id"];
            isOneToOne: false;
            referencedRelation: "vocabularies";
            referencedColumns: ["id"];
          },
        ];
      };
      moderator_languages: {
        Row: {
          user_id: string;
          language_id: number;
          assigned_by: string | null;
          assigned_at: string;
        };
        Insert: {
          user_id: string;
          language_id: number;
          assigned_by?: string | null;
          assigned_at?: string;
        };
        Update: {
          user_id?: string;
          language_id?: number;
          assigned_by?: string | null;
          assigned_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "moderator_languages_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "moderator_languages_language_id_fkey";
            columns: ["language_id"];
            isOneToOne: false;
            referencedRelation: "languages";
            referencedColumns: ["id"];
          },
        ];
      };
      moderation_log: {
        Row: {
          id: number;
          actor_id: string | null;
          action: Database["public"]["Enums"]["moderation_action"];
          language_id: number | null;
          target_type: string;
          target_id: string;
          detail: Json | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          actor_id?: string | null;
          action: Database["public"]["Enums"]["moderation_action"];
          language_id?: number | null;
          target_type: string;
          target_id: string;
          detail?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          actor_id?: string | null;
          action?: Database["public"]["Enums"]["moderation_action"];
          language_id?: number | null;
          target_type?: string;
          target_id?: string;
          detail?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "moderation_log_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "moderation_log_language_id_fkey";
            columns: ["language_id"];
            isOneToOne: false;
            referencedRelation: "languages";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      weekly_leaderboard: {
        Row: {
          user_id: string | null;
          username: string | null;
          avatar_url: string | null;
          home_region_id: number | null;
          weekly_xp: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      complete_lesson: {
        Args: { p_lesson_id: number; p_score: number };
        Returns: Json;
      };
      is_moderator: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      can_moderate: {
        Args: { p_language_id: number };
        Returns: boolean;
      };
      review_submission: {
        Args: {
          p_id: number;
          p_decision: Database["public"]["Enums"]["submission_status"];
          p_reject_reason?: Database["public"]["Enums"]["reject_reason"] | null;
          p_note?: string | null;
          p_edits?: Json | null;
        };
        Returns: Json;
      };
      get_submission_queue: {
        Args: {
          p_status?: Database["public"]["Enums"]["submission_status"];
          p_language_id?: number | null;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: {
          id: number;
          language_id: number;
          language_name: string;
          language_code: string;
          word: string;
          meaning_id: string;
          audio_url: string | null;
          status: Database["public"]["Enums"]["submission_status"];
          created_at: string;
          reviewed_at: string | null;
          reject_reason: Database["public"]["Enums"]["reject_reason"] | null;
          review_note: string | null;
          original: Json | null;
          vocabulary_id: number | null;
          submitter_id: string;
          submitter_username: string | null;
          submitter_approved: number;
          submitter_reviewed: number;
          reviewer_username: string | null;
          is_own: boolean;
          duplicates: Json;
          total_count: number;
        }[];
      };
      set_moderator_languages: {
        Args: { p_user: string; p_language_ids: number[] };
        Returns: Json;
      };
      get_moderation_overview: {
        Args: Record<PropertyKey, never>;
        Returns: {
          language_id: number;
          language_name: string;
          language_code: string;
          pending_count: number;
          oldest_pending_at: string | null;
          reviewed_7d: number;
          approved_7d: number;
          moderator_count: number;
          articles_review: number;
          articles_draft: number;
        }[];
      };
      get_my_moderation_stats: {
        Args: { p_days?: number };
        Returns: Json;
      };
    };
    Enums: {
      unit_level: "pemula" | "menengah" | "mahir";
      question_type: "multiple_choice" | "translate" | "listen" | "match" | "arrange" | "speak";
      article_category:
        | "sejarah"
        | "cerita_rakyat"
        | "tarian"
        | "kuliner"
        | "pakaian_adat"
        | "upacara"
        | "aksara"
        | "lainnya";
      user_role: "user" | "moderator" | "admin";
      lesson_status: "in_progress" | "completed";
      submission_status: "pending" | "approved" | "rejected";
      chat_role: "user" | "assistant";
      reject_reason:
        | "duplikat"
        | "ejaan"
        | "arti_keliru"
        | "bukan_bahasa_ini"
        | "tidak_pantas"
        | "audio_buruk"
        | "lainnya";
      article_status: "draft" | "review" | "published" | "archived";
      moderation_action:
        | "submission_approved"
        | "submission_rejected"
        | "vocab_updated"
        | "vocab_hidden"
        | "vocab_restored"
        | "article_created"
        | "article_updated"
        | "article_status_changed"
        | "article_deleted"
        | "report_resolved"
        | "report_dismissed"
        | "moderator_assigned"
        | "moderator_removed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];
export type Views<T extends keyof PublicSchema["Views"]> = PublicSchema["Views"][T]["Row"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
