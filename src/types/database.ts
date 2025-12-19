export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: string;
          company_name: string | null;
          company_logo: string | null;
          phone_number: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: string;
          company_name?: string | null;
          company_logo?: string | null;
          phone_number?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: string;
          company_name?: string | null;
          company_logo?: string | null;
          phone_number?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      agent_registrations: {
        Row: {
          id: string;
          company_name: string;
          company_logo: string | null;
          address: string;
          email: string;
          phone_no: string;
          username: string;
          status: string;
          created_at: string;
          updated_at: string;
          approved_by: string | null;
          approved_at: string | null;
        };
        Insert: {
          id?: string;
          company_name: string;
          company_logo?: string | null;
          address: string;
          email: string;
          phone_no: string;
          username: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
          approved_by?: string | null;
          approved_at?: string | null;
        };
        Update: {
          id?: string;
          company_name?: string;
          company_logo?: string | null;
          address?: string;
          email?: string;
          phone_no?: string;
          username?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
          approved_by?: string | null;
          approved_at?: string | null;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          whatsapp: string;
          country_code: string;
          travel_dates_start_date: string | null;
          travel_dates_end_date: string | null;
          travel_dates_is_flexible: boolean;
          travel_dates_flexible_month: string | null;
          number_of_pax_adults: number;
          number_of_pax_children: number;
          number_of_days: number;
          transportation_mode: string;
          created_at: string;
          created_by: string | null;
          follow_up_status_status: string | null;
          follow_up_status_updated_at: string | null;
          follow_up_status_remarks: string | null;
          next_follow_up_date: string | null;
          next_follow_up_time: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          whatsapp: string;
          country_code: string;
          travel_dates_start_date?: string | null;
          travel_dates_end_date?: string | null;
          travel_dates_is_flexible?: boolean;
          travel_dates_flexible_month?: string | null;
          number_of_pax_adults: number;
          number_of_pax_children: number;
          number_of_days: number;
          transportation_mode: string;
          created_at?: string;
          created_by?: string | null;
          follow_up_status_status?: string | null;
          follow_up_status_updated_at?: string | null;
          follow_up_status_remarks?: string | null;
          next_follow_up_date?: string | null;
          next_follow_up_time?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          whatsapp?: string;
          country_code?: string;
          travel_dates_start_date?: string | null;
          travel_dates_end_date?: string | null;
          travel_dates_is_flexible?: boolean;
          travel_dates_flexible_month?: string | null;
          number_of_pax_adults?: number;
          number_of_pax_children?: number;
          number_of_days?: number;
          transportation_mode?: string;
          created_at?: string;
          created_by?: string | null;
          follow_up_status_status?: string | null;
          follow_up_status_updated_at?: string | null;
          follow_up_status_remarks?: string | null;
          next_follow_up_date?: string | null;
          next_follow_up_time?: string | null;
        };
      };
      transportations: {
        Row: {
          id: string;
          type: string;
          vehicle_name: string;
          cost_per_day: number;
          min_occupancy: number;
          max_occupancy: number;
          area_id: string | null;
          area_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          vehicle_name: string;
          cost_per_day: number;
          min_occupancy?: number;
          max_occupancy?: number;
          area_id?: string | null;
          area_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          vehicle_name?: string;
          cost_per_day?: number;
          min_occupancy?: number;
          max_occupancy?: number;
          area_id?: string | null;
          area_name?: string | null;
          created_at?: string;
        };
      };
      hotels: {
        Row: {
          id: string;
          name: string;
          place: string;
          star_category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          place: string;
          star_category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          place?: string;
          star_category?: string;
          created_at?: string;
        };
      };
      room_types: {
        Row: {
          id: string;
          hotel_id: string;
          name: string;
          peak_season_price: number;
          season_price: number;
          off_season_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          hotel_id: string;
          name: string;
          peak_season_price: number;
          season_price: number;
          off_season_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          hotel_id?: string;
          name?: string;
          peak_season_price?: number;
          season_price?: number;
          off_season_price?: number;
          created_at?: string;
        };
      };
      sightseeings: {
        Row: {
          id: string;
          name: string;
          display_name: string | null;
          description: string;
          transportation_mode: string;
          vehicle_costs: any | null;
          area_id: string | null;
          area_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_name?: string | null;
          description: string;
          transportation_mode: string;
          vehicle_costs?: any | null;
          area_id?: string | null;
          area_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string | null;
          description?: string;
          transportation_mode?: string;
          vehicle_costs?: any | null;
          area_id?: string | null;
          area_name?: string | null;
          created_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          name: string;
          location: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string;
          created_at?: string;
        };
      };
      activity_options: {
        Row: {
          id: string;
          activity_id: string;
          name: string;
          cost: number;
          cost_for_how_many: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          activity_id: string;
          name: string;
          cost: number;
          cost_for_how_many: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          activity_id?: string;
          name?: string;
          cost?: number;
          cost_for_how_many?: number;
          created_at?: string;
        };
      };
      entry_tickets: {
        Row: {
          id: string;
          name: string;
          adult_cost: number;
          child_cost: number;
          area_id: string | null;
          area_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          adult_cost: number;
          child_cost: number;
          area_id?: string | null;
          area_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          adult_cost?: number;
          child_cost?: number;
          area_id?: string | null;
          area_name?: string | null;
          created_at?: string;
        };
      };
      meals: {
        Row: {
          id: string;
          type: string;
          place: string;
          cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          place: string;
          cost: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          place?: string;
          cost?: number;
          created_at?: string;
        };
      };
      areas: {
        Row: {
          id: string;
          name: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      itineraries: {
        Row: {
          id: string;
          client_id: string;
          total_base_cost: number;
          profit_margin: number;
          final_price: number;
          exchange_rate: number;
          version: number;
          last_updated: string;
          updated_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          total_base_cost?: number;
          profit_margin?: number;
          final_price?: number;
          exchange_rate?: number;
          version?: number;
          last_updated?: string;
          updated_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          total_base_cost?: number;
          profit_margin?: number;
          final_price?: number;
          exchange_rate?: number;
          version?: number;
          last_updated?: string;
          updated_by?: string;
          created_at?: string;
        };
      };
      day_plans: {
        Row: {
          id: string;
          itinerary_id: string;
          day: number;
          sightseeing_ids: string[];
          hotel_place: string | null;
          hotel_id: string | null;
          room_type_id: string | null;
          activities_data: any;
          entry_ticket_ids: string[];
          meal_ids: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          itinerary_id: string;
          day: number;
          sightseeing_ids?: string[];
          hotel_place?: string | null;
          hotel_id?: string | null;
          room_type_id?: string | null;
          activities_data?: any;
          entry_ticket_ids?: string[];
          meal_ids?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          itinerary_id?: string;
          day?: number;
          sightseeing_ids?: string[];
          hotel_place?: string | null;
          hotel_id?: string | null;
          room_type_id?: string | null;
          activities_data?: any;
          entry_ticket_ids?: string[];
          meal_ids?: string[];
          created_at?: string;
        };
      };
      itinerary_changes: {
        Row: {
          id: string;
          itinerary_id: string;
          version: number;
          change_type: string;
          description: string;
          timestamp: string;
          updated_by: string;
          previous_data: any | null;
          new_data: any | null;
        };
        Insert: {
          id?: string;
          itinerary_id: string;
          version: number;
          change_type: string;
          description: string;
          timestamp?: string;
          updated_by: string;
          previous_data?: any | null;
          new_data?: any | null;
        };
        Update: {
          id?: string;
          itinerary_id?: string;
          version?: number;
          change_type?: string;
          description?: string;
          timestamp?: string;
          updated_by?: string;
          previous_data?: any | null;
          new_data?: any | null;
        };
      };
      fixed_itineraries: {
        Row: {
          id: string;
          name: string;
          number_of_days: number;
          transportation_mode: string;
          base_cost: number;
          inclusions: string;
          exclusions: string;
          day_plans_data: any;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          name: string;
          number_of_days: number;
          transportation_mode: string;
          base_cost: number;
          inclusions: string;
          exclusions: string;
          day_plans_data: any;
          created_at?: string;
          updated_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          name?: string;
          number_of_days?: number;
          transportation_mode?: string;
          base_cost?: number;
          inclusions?: string;
          exclusions?: string;
          day_plans_data?: any;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
      };
      follow_up_records: {
        Row: {
          id: string;
          client_id: string;
          status: string;
          remarks: string;
          updated_at: string;
          next_follow_up_date: string | null;
          next_follow_up_time: string | null;
          updated_by: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          status: string;
          remarks: string;
          updated_at?: string;
          next_follow_up_date?: string | null;
          next_follow_up_time?: string | null;
          updated_by: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          status?: string;
          remarks?: string;
          updated_at?: string;
          next_follow_up_date?: string | null;
          next_follow_up_time?: string | null;
          updated_by?: string;
        };
      };
    };
  };
}