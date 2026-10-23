// 前後端共用：職缺類型、建議面向、回傳結構

export const JOB_TYPES = [
  "行政人員",
  "人事人員",
  "都市更新相關人員",
  "總務人員",
  "文件管理人員",
  "文書人員",
  "業務助理",
] as const;

export type JobType = (typeof JOB_TYPES)[number];

// 建議面向固定為這五個，順序即前端顯示順序
export const CATEGORIES = {
  impact: { title: "成果與量化", description: "經歷是否寫出具體成果與數字" },
  relevance: { title: "職缺相關性", description: "內容是否對準目標職缺" },
  skills: { title: "技能呈現", description: "技能是否具體、有佐證" },
  wording: { title: "用字與表達", description: "語句是否精簡、主動、專業" },
  structure: { title: "結構與排版", description: "段落順序、長度、易讀性" },
} as const;

export type CategoryId = keyof typeof CATEGORIES;
export const CATEGORY_IDS = Object.keys(CATEGORIES) as CategoryId[];

export type Severity = "high" | "medium" | "low";

export interface Suggestion {
  /** 履歷中的原句，逐字引用 */
  quote: string;
  /** 這句話的問題 */
  problem: string;
  /** 建議改寫後的句子或做法 */
  fix: string;
  severity: Severity;
}

export interface CategoryResult {
  id: CategoryId;
  suggestions: Suggestion[];
}

export interface AnalysisResult {
  /** 0–100 */
  score: number;
  summary: string;
  categories: CategoryResult[];
}

export type AnalyzeResponse =
  | { ok: true; result: AnalysisResult }
  | { ok: false; error: string };

export const MAX_PDF_BYTES = 10 * 1024 * 1024;

// OpenAI Structured Outputs（strict）用的 JSON Schema，需與上面的型別一致
export const ANALYSIS_JSON_SCHEMA = {
  type: "object",
  properties: {
    score: { type: "integer", description: "整體分數 0-100" },
    summary: { type: "string", description: "2-3 句整體評語" },
    categories: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", enum: CATEGORY_IDS },
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                quote: { type: "string", description: "履歷中的原句，逐字引用，不可改寫" },
                problem: { type: "string", description: "這句話的問題" },
                fix: { type: "string", description: "建議改寫後的完整句子或具體做法" },
                severity: { type: "string", enum: ["high", "medium", "low"] },
              },
              required: ["quote", "problem", "fix", "severity"],
              additionalProperties: false,
            },
          },
        },
        required: ["id", "suggestions"],
        additionalProperties: false,
      },
    },
  },
  required: ["score", "summary", "categories"],
  additionalProperties: false,
} as const;
