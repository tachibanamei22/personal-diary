export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string;
          display_name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      entry_images: {
        Row: {
          id: string;
          entry_id: string;
          user_id: string;
          storage_path: string;
          url: string;
          x: number;
          y: number;
          rotation: number;
          z_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          entry_id: string;
          user_id: string;
          storage_path: string;
          url: string;
          x?: number;
          y?: number;
          rotation?: number;
          z_index?: number;
          created_at?: string;
        };
        Update: {
          x?: number;
          y?: number;
          rotation?: number;
          z_index?: number;
        };
        Relationships: [];
      };
      entries: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          mood: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          mood?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          mood?: string | null;
          tags?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_email_by_username: {
        Args: { p_username: string };
        Returns: string | null;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
