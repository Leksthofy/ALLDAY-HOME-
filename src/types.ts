export type FamilyMember = "Thiago" | "Erika" | "Zoe" | "Família";

export interface MemberProfile {
  id: string;
  name: FamilyMember;
  role: string;
  avatarColor: string;
  initials: string;
  avatarUrl?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  endTime?: string;
  member: FamilyMember;
  category: "Trabalho" | "Pessoal" | "Saúde" | "Escola" | "Lazer";
  location?: string;
  googleSynced?: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: "Supermercado" | "Farmácia" | "Feira" | "Casa" | "Outros";
  completed: boolean;
  addedBy: FamilyMember;
  quantity?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  assignee: FamilyMember;
  dueDate?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  category: "Limpeza" | "Manutenção" | "Trabalho" | "Pessoal" | "Geral";
}

export interface DailyRoutine {
  id: string;
  dayOfWeek: "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo";
  title: string;
  assignee: FamilyMember;
  completed: boolean;
  timeOfDay?: "Manhã" | "Tarde" | "Noite";
}

export interface MealPlanItem {
  id: string;
  dayOfWeek: "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo";
  lunch: string;
  dinner: string;
  ingredientsNeeded?: string[];
}

export interface FamilyPhoto {
  id: string;
  title: string;
  url: string;
  caption?: string;
  dateAdded: string;
}

export interface BillItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  paid: boolean;
  category: "Moradia" | "Serviços" | "Educação" | "Saúde" | "Outros";
  autoDebit?: boolean;
}

export interface ChildLogRecord {
  id: string;
  type: "Vacina" | "Consulta" | "Crescimento" | "Remédio";
  title: string;
  date: string;
  notes?: string;
  value?: string; // e.g. "82 cm / 11.5 kg"
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  high: number;
  low: number;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  uvIndex: number;
  forecast: Array<{ day: string; temp: number; icon: string; text: string }>;
  hourly: Array<{ time: string; temp: number; icon: string }>;
}

export type ActiveTab =
  | "dashboard"
  | "calendar"
  | "shopping"
  | "tasks"
  | "routines"
  | "meals"
  | "photos"
  | "finances"
  | "zoe"
  | "alexa"
  | "settings";

export type RemoteCommandType =
  | "NAVIGATE_TAB"
  | "TOGGLE_SCREENSAVER"
  | "SET_SCREENSAVER"
  | "NEXT_PHOTO"
  | "PREV_PHOTO"
  | "ADD_SHOPPING"
  | "TOGGLE_SHOPPING"
  | "DELETE_SHOPPING"
  | "ADD_EVENT"
  | "DELETE_EVENT"
  | "ADD_TASK"
  | "TOGGLE_TASK"
  | "DELETE_TASK"
  | "ADD_ZOE_LOG"
  | "DELETE_ZOE_LOG"
  | "SEND_ANNOUNCEMENT"
  | "OPEN_AI_VOICE"
  | "TRIGGER_AI_PARSE"
  | "REQUEST_STATE_SYNC"
  | "SYNC_FULL_STATE";

export interface RemoteCommand {
  id: string;
  type: RemoteCommandType;
  payload?: any;
  sender?: string;
  timestamp: number;
}

export interface RemoteToastNotification {
  id: string;
  title: string;
  message: string;
  sender?: string;
  type?: "info" | "success" | "alert" | "voice";
  timestamp: number;
}

