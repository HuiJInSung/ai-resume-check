import {
  ANALYSIS_JSON_SCHEMA,
  CATEGORIES,
  CATEGORY_IDS,
  JOB_TYPES,
  MAX_PDF_BYTES,
  type AnalysisResult,
  type AnalyzeResponse,
  type JobType,
} from "@/lib/resume";

const OPENAI_URL = "https://api.openai.com/v1/responses";
const MODEL = "gpt-6.1-sol";

function fail(error: string, status: number) {
  return Response.json({ ok: false, error } satisfies AnalyzeResponse, { status });
}

function buildPrompt(jobType: JobType) {
  const categoryList = CATEGORY_IDS.map(
    (id) => `- ${id}：${CATEGORIES[id].title}（${CATEGORIES[id].description}）`,
  ).join("\n");

  return `你是資深的人資顧問與履歷教練。使用者要應徵「${jobType}」，附件是他的履歷 PDF。
請針對這個職缺給出具體的優化建議，並依照以下面向分類：
${categoryList}

規則：
1. categories 必須剛好包含上面五個 id，各出現一次，依上面順序排列。
2. 每條建議的 quote 必須「逐字」引用履歷中的原句（保留原本語言，不要翻譯、不要改寫、不要自己編）。若該面向的問題是「缺少某項內容」，就引用最相關的現有句子。
3. problem 說明這句話的問題；fix 給出可直接替換的改寫句，或具體的修改做法。
4. 每個面向給 1–5 條建議，按重要性排序；真的沒問題的面向可以給空陣列。
5. 除了 quote 之外，所有文字使用繁體中文。
6. score 為 0–100 的整數，代表這份履歷對「${jobType}」職缺的整體完成度。`;
}

// 從 Responses API 的原始 JSON 中取出模型輸出的文字
function extractOutputText(data: unknown): { text?: string; refusal?: string } {
  const output = (data as { output?: unknown[] })?.output ?? [];
  for (const item of output as { type?: string; content?: unknown[] }[]) {
    if (item.type !== "message") continue;
    for (const part of (item.content ?? []) as { type?: string; text?: string; refusal?: string }[]) {
      if (part.type === "output_text" && part.text) return { text: part.text };
      if (part.type === "refusal") return { refusal: part.refusal ?? "模型拒絕回答" };
    }
  }
  return {};
}

export async function POST(request: Request) {
  // 金鑰只用於這次轉送給 OpenAI，不寫入 log、不保存
  const apiKey = request.headers.get("x-openai-key")?.trim();
  if (!apiKey) return fail("缺少 OpenAI API Key", 401);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("請用 multipart/form-data 上傳", 400);
  }

  const file = form.get("file");
  const jobType = form.get("jobType");

  if (!(file instanceof File)) return fail("請上傳履歷 PDF", 400);
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return fail("只接受 PDF 檔", 400);
  }
  if (file.size > MAX_PDF_BYTES) return fail("PDF 不能超過 10 MB", 413);
  if (typeof jobType !== "string" || !JOB_TYPES.includes(jobType as JobType)) {
    return fail("請選擇職缺類型", 400);
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

  let res: Response;
  try {
    res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        store: false,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_file",
                filename: file.name || "resume.pdf",
                file_data: `data:application/pdf;base64,${base64}`,
              },
              { type: "input_text", text: buildPrompt(jobType as JobType) },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "resume_analysis",
            strict: true,
            schema: ANALYSIS_JSON_SCHEMA,
          },
        },
      }),
    });
  } catch {
    return fail("無法連線到 OpenAI，請稍後再試", 502);
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401) return fail("OpenAI API Key 無效，請重新設定", 401);
    if (res.status === 429) return fail("OpenAI 額度不足或請求太頻繁，請檢查帳戶餘額後再試", 429);
    const message = (data as { error?: { message?: string } })?.error?.message;
    return fail(`OpenAI 回傳錯誤：${message ?? res.status}`, 502);
  }

  const { text, refusal } = extractOutputText(data);
  if (refusal) return fail(`模型拒絕分析：${refusal}`, 422);
  if (!text) return fail("OpenAI 沒有回傳內容", 502);

  let result: AnalysisResult;
  try {
    result = JSON.parse(text);
  } catch {
    return fail("OpenAI 回傳格式錯誤", 502);
  }

  // 依固定順序排列，並補上模型漏掉的面向
  result.categories = CATEGORY_IDS.map(
    (id) => result.categories.find((c) => c.id === id) ?? { id, suggestions: [] },
  );
  result.score = Math.max(0, Math.min(100, Math.round(result.score)));

  return Response.json({ ok: true, result } satisfies AnalyzeResponse);
}
