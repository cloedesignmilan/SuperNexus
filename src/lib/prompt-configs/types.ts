export interface PromptShot {
  shot_number: number;
  shot_name: string;
  positive_prompt: string;
  negative_prompt: string;
  hard_rules: string;
  output_goal: string;
}

export interface PromptConfigRow {
  category: string;
  mode: string;
  presentation: string;
  scene: string; // "all", "studio", "lifestyle", etc.
  quantity: number;
  shots: PromptShot[];
}
