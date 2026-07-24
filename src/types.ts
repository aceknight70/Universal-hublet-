export type Role = 'staff' | 'manager' | 'master';

export interface Database {
  public: {
    Tables: {
      manifest_clients: {
        Row: {
          id: string;
          name: string;
          exclusive_to_client_id?: string | null;
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
          exclusive_to_client_id?: string | null;
          logo_url: string | null;
          sort_order?: number;
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
          client_id: string | null;
          name: string;
          exclusive_to_client_id?: string | null;
          role: Role;
          email?: string;
        };
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      manifest_catalog: {
        Row: {
          id: string;
          brand: string | null;
          category: string | null;
          name: string;
          exclusive_to_client_id?: string | null;
          spec_sheet: any | null;
          reference_photo_url: string | null;
          created_at: string;
        };
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      manifest_inventory: {
        Row: {
          id: string;
          client_id: string;
          catalog_id: string;
          price: number | null;
          tag: string | null;
          created_at: string;
        };
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      manifest_invoice_design: {
        Row: {
          id: string;
          client_id: string;
          logo_url: string | null;
          sort_order?: number;
          primary_color: string | null;
          layout_style: string | null;
          bank_name: string | null;
          account_name: string | null;
          account_number: string | null;
          created_at: string;
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
          exclusive_to_client_id?: string | null;
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
      manifest_cart: {
        Row: {
          id: string;
          client_id: string;
          session_id: string;
          items: any;
          updated_at: string;
        };
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      manifest_gallery: {
        Row: {
          id: string;
          client_id: string;
          photo_url: string;
          caption: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          photo_url: string;
          caption?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          photo_url?: string;
          caption?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Client = Database['public']['Tables']['manifest_clients']['Row'];
// We maintain Product as the unified front-end interface, representing an InventoryItem + CatalogItem
export interface Product {
  id: string; // mapped to catalog_id or inventory_id depending on context
  inventory_id?: string;
  catalog_id?: string;
  code?: string;
  brand_id?: string | null;
  brand?: string | null;
  category: string;
  name: string;
          exclusive_to_client_id?: string | null;
  description_headline?: string | null;
  description_bullets?: string[] | null;
  technical_specs?: any | null;
  spec_sheet?: any | null;
  price: number | null;
  tag?: string | null;
  assurance_yn?: boolean;
  assurance_text?: string | null;
  contact_link?: string | null;
  laggard_yn?: boolean;
  laggard_promo_text?: string | null;
  stock_status?: string | null;
  search_keywords?: string[] | null;
  preset_tags?: string[] | null;
  created_at?: string;
  updated_at?: string;
  main_image?: string;
  reference_photo_url?: string | null;
}

export type Brand = Database['public']['Tables']['manifest_brands']['Row'];
export type Staff = Database['public']['Tables']['manifest_staff']['Row'];
export type CatalogItem = Database['public']['Tables']['manifest_catalog']['Row'];
export type InventoryItem = Database['public']['Tables']['manifest_inventory']['Row'];
export type InvoiceDesign = Database['public']['Tables']['manifest_invoice_design']['Row'];

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
