/*
 * @Author: Chiron 598621670@qq.com
 * @Date: 2026-01-06 17:34:03
 * @LastEditors: Chiron 598621670@qq.com
 * @LastEditTime: 2026-01-07 00:53:05
 * @FilePath: /proxycast/src/components/provider-pool/api-key/providerTypeMapping.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * @file Provider 类型映射工具
 * @description Provider ID/类型到 model_registry provider_id 的映射
 * @module components/provider-pool/api-key/providerTypeMapping
 */

/**
 * Provider ID 到 model_registry provider_id 的映射
 * 用于将系统 Provider ID（如 deepseek, moonshot）映射到模型注册表中的 provider_id
 */
const PROVIDER_ID_TO_REGISTRY_ID: Record<string, string> = {
  // 主流 AI
  openai: "openai",
  anthropic: "anthropic",
  google: "google", // Gemini
  deepseek: "deepseek",
  moonshotai: "moonshotai",
  groq: "groq",
  xai: "xai", // Grok
  mistral: "mistral",
  perplexity: "perplexity",
  cohere: "cohere",
  // 国内 AI
  zhipuai: "zhipuai",
  baichuan: "baichuan",
  alibaba: "alibaba", // 百炼/通义千问
  doubao: "doubao",
  minimax: "minimax",
  stepfun: "stepfun",
  yi: "yi", // 零一万物
  "baidu-cloud": "baidu-cloud",
  hunyuan: "hunyuan",
  xiaomi: "xiaomi", // 小米 MiMo
  // 云服务
  "azure-openai": "openai",
  "google-vertex": "google-vertex",
  "amazon-bedrock": "amazon-bedrock",
  "github-models": "github-models",
  "github-copilot": "github-copilot",
  // API 聚合服务
  siliconflow: "siliconflow",
  "siliconflow-cn": "siliconflow-cn",
  openrouter: "openrouter",
  togetherai: "togetherai",
  "fireworks-ai": "fireworks-ai",
  aihubmix: "aihubmix",
  "302ai": "302ai",
  // 代理服务
  iflow: "deepseek",
  antigravity: "antigravity",
  codex: "codex",
  // 本地服务
  ollama: "ollama",
  lmstudio: "lmstudio",
  // 兼容旧 ID（向后兼容）
  gemini: "google",
  zhipu: "zhipuai",
  dashscope: "alibaba",
  moonshot: "moonshotai",
  grok: "xai",
  github: "github-models",
  copilot: "github-copilot",
  vertexai: "google-vertex",
  "aws-bedrock": "amazon-bedrock",
  together: "togetherai",
  fireworks: "fireworks-ai",
  mimo: "xiaomi",
  silicon: "siliconflow",
};

/**
 * Provider 类型（API 协议）到 model_registry provider_id 的映射
 * 作为 Provider ID 映射的回退
 */
const PROVIDER_TYPE_TO_REGISTRY_ID: Record<string, string> = {
  anthropic: "anthropic",
  "anthropic-compatible": "anthropic", // Anthropic 兼容格式
  openai: "openai",
  "openai-response": "openai",
  gemini: "gemini",
};

/**
 * 将 Provider ID 转换为 model_registry 的 provider_id
 * 优先使用 Provider ID 映射，回退到 Provider Type 映射
 *
 * @param providerId Provider ID（如 "deepseek", "openai"）
 * @param providerType Provider 类型/API 协议（如 "openai", "anthropic"）
 * @returns model_registry 中的 provider_id
 */
export function mapProviderIdToRegistryId(
  providerId: string,
  providerType?: string,
): string {
  // 优先使用 Provider ID 映射
  if (PROVIDER_ID_TO_REGISTRY_ID[providerId]) {
    return PROVIDER_ID_TO_REGISTRY_ID[providerId];
  }

  // 回退到 Provider Type 映射
  if (providerType && PROVIDER_TYPE_TO_REGISTRY_ID[providerType]) {
    return PROVIDER_TYPE_TO_REGISTRY_ID[providerType];
  }

  // 最后回退到原始 providerId
  return providerId;
}

/**
 * @deprecated 使用 mapProviderIdToRegistryId 代替
 * 将 Provider 类型转换为 model_registry 的 provider_id
 */
export function mapProviderTypeToRegistryId(providerType: string): string {
  return PROVIDER_TYPE_TO_REGISTRY_ID[providerType] || providerType;
}
