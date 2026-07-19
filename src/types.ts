export type Role = 'staff' | 'manager' | 'master';

export interface Database {
  public: {
    Tables: {
      manifest_clients: {
        Row: {
          id: string;
          name: string;
          slug: string;
          categories: string | any[];
          theme: {
            accent_color?: string;
            logo_url?: string;
            banner_url?: string;
          } | any;
          created_at: string;
        };
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      manifest_brands: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
        };
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      manifest_client_brands: {
        Row: {
          id: string;
          client_id: string;
          brand_id: string;
          tier: number;
          display_order: number;
          is_assigned: boolean;
        };
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      manifest_staff: {
        Row: {
          id: string;
          client_id: string | null; // null for master across all?
          name: string;
          role: Role;
          email?: string; // used for auth mapping
        };
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      manifest_products: {
        Row: {
          id: string;
          code: string;
          brand_id: string | null;
          category: string;
          name: string;
          description_headline: string | null;
          description_bullets: string[] | null;
          technical_specs: any | null;
          price: number | null;
          assurance_yn: boolean;
          assurance_text: string | null;
          contact_link: string | null;
          laggard_yn: boolean;
          laggard_promo_text: string | null;
          stock_status: string | null;
          search_keywords: string[] | null;
          preset_tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      manifest_client_product_overrides: {
        Row: {
          id: string;
          client_id: string;
          product_id: string;
          price: number | null;
          featured: boolean;
          preset_tags: string[] | null;
        };
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      manifest_product_images: {
        Row: {
          id: string;
          product_id: string;
          slot: string;
          image_url: string;
          created_at: string;
        };
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      manifest_photo_inbox: {
        Row: {
          id: string;
          client_id: string;
          image_url: string;
          status: string;
          created_at: string;
        };
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      manifest_brand_ads: {
        Row: {
          id: string;
          brand_id: string;
          banner_url: string;
          tagline: string;
          description: string;
          cta: string;
          active: boolean;
        };
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Extracted application types
export type Client = Database['public']['Tables']['manifest_clients']['Row'];
export type Product = Database['public']['Tables']['manifest_products']['Row'];
export type Brand = Database['public']['Tables']['manifest_brands']['Row'];
export type Staff = Database['public']['Tables']['manifest_staff']['Row'];

export const SHARED_CATEGORIES = [
  'Television',
  'Refrigerator',
  'Air Conditioner',
  'Washing Machine',
  'Cooker',
  'Generator',
  'Kitchen Appliances',
  'Solar'
] as const;
