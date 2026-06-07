/**
 * 主题配置工具
 */

import type { SiteConfig } from "./site-config";

// ============================================
// 主题颜色默认值
// ============================================

export const DEFAULT_THEME_COLORS = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  accent: "#06b6d4",
  background: "#ffffff",
  surface: "#f9fafb",
  text: "#1f2937",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
};

// 默认字体配置
export const DEFAULT_FONTS = {
  heading: "system-ui, -apple-system, sans-serif",
  body: "system-ui, -apple-system, sans-serif",
  code: "Menlo, Monaco, 'Courier New', monospace",
};

// ============================================
// 主题验证
// ====================================

export interface ThemeValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * 验证主题颜色配置
 */
export function validateThemeColors(colors: Partial<SiteConfig["themeColors"]>): ThemeValidationResult {
  const errors: string[] = [];

  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  for (const [key, value] of Object.entries(colors)) {
    if (value && !hexColorRegex.test(value)) {
      errors.push(`主题颜色 "${key}" 格式无效，应为十六进制颜色值（如 #3b82f6）`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================
// 解析工具函数
// ============================================

/**
 * 解析主题颜色配置（从 JSON 字符串解析）
 */
export function parseThemeColors(json?: string | null): Record<string, string> {
  if (!json) return DEFAULT_THEME_COLORS as unknown as Record<string, string>;
  try {
    return JSON.parse(json);
  } catch {
    return DEFAULT_THEME_COLORS as unknown as Record<string, string>;
  }
}

/**
 * 解析字体配置（从 JSON 字符串解析）
 */
export function parseFonts(json?: string | null): Record<string, string> {
  if (!json) return DEFAULT_FONTS;
  try {
    return JSON.parse(json);
  } catch {
    return DEFAULT_FONTS;
  }
}

/**
 * 解析布局配置（从 JSON 字符串解析）
 */
export function parseLayoutConfig(json?: string | null): Record<string, unknown> {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

/**
 * 获取亮/暗色背景/文字颜色
 */
export function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace("#", "");
  // 校验是否为有效的十六进制颜色格式
  if (!/^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) {
    return "#000000"; // 不支持的格式回退到黑色
  }
  // 补全 3 位简写为 6 位
  const fullHex = hex.length === 3
    ? hex.split("").map((c) => c + c).join("")
    : hex;
  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

// ============================================
// 主题预览
// ============================================

/**
 * 生成主题 CSS 变量字符串
 */
export function generateThemeCSS(colors: SiteConfig["themeColors"]): string {
  return `
:root {
  --color-primary: ${colors.primary || DEFAULT_THEME_COLORS.primary};
  --color-secondary: ${colors.secondary || DEFAULT_THEME_COLORS.secondary};
  --color-accent: ${colors.accent || DEFAULT_THEME_COLORS.accent};
  --color-background: ${colors.background || DEFAULT_THEME_COLORS.background};
  --color-surface: ${colors.surface || DEFAULT_THEME_COLORS.surface};
  --color-text: ${colors.text || DEFAULT_THEME_COLORS.text};
  --color-text-secondary: ${colors.textSecondary || DEFAULT_THEME_COLORS.textSecondary};
  --color-border: ${colors.border || DEFAULT_THEME_COLORS.border};
  --color-success: ${colors.success || DEFAULT_THEME_COLORS.success};
  --color-warning: ${colors.warning || DEFAULT_THEME_COLORS.warning};
  --color-error: ${colors.error || DEFAULT_THEME_COLORS.error};
}
`.trim();
}

/**
 * 生成内联主题样式（用于 HTML style 属性）
 */
export function generateInlineThemeStyle(colors: Partial<SiteConfig["themeColors"]>): string {
  const pairs: string[] = [];

  const mapping: Record<string, string> = {
    background: "background-color",
    text: "color",
    primary: "--primary-color",
  };

  for (const [key, value] of Object.entries(colors)) {
    if (value) {
      if (key === "background" || key === "text") {
        pairs.push(`${mapping[key]}: ${value}`);
      } else if (["primary", "secondary", "accent"].includes(key)) {
        pairs.push(`--${key}-color: ${value}`);
      }
    }
  }

  return pairs.join("; ");
}

// ============================================
// 预设主题
// ============================================

export const PRESET_THEMES: Record<string, Partial<SiteConfig["themeColors"]>> = {
  default: {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    accent: "#06b6d4",
  },
  ocean: {
    primary: "#0ea5e9",
    secondary: "#0284c7",
    accent: "#38bdf8",
  },
  forest: {
    primary: "#22c55e",
    secondary: "#16a34a",
    accent: "#86efac",
  },
  sunset: {
    primary: "#f97316",
    secondary: "#ea580c",
    accent: "#fb923c",
  },
  rose: {
    primary: "#f43f5e",
    secondary: "#e11d48",
    accent: "#fb7185",
  },
  midnight: {
    primary: "#6366f1",
    secondary: "#4f46e5",
    accent: "#818cf8",
  },
};

/**
 * 获取预设主题
 */
export function getPresetTheme(name: string): Partial<SiteConfig["themeColors"]> | null {
  return PRESET_THEMES[name] || null;
}

// ============================================
// 布局配置工具
// ============================================

export interface LayoutConfig {
  containerMaxWidth: string;
  sidebarWidth: string;
  cardBorderRadius: string;
  spacing: string;
}

/**
 * 获取布局配置
 */
export function getLayoutConfig(layout?: Partial<LayoutConfig>): LayoutConfig {
  const presets: Record<string, LayoutConfig> = {
    wide: {
      containerMaxWidth: "1400px",
      sidebarWidth: "280px",
      cardBorderRadius: "12px",
      spacing: "24px",
    },
    narrow: {
      containerMaxWidth: "800px",
      sidebarWidth: "240px",
      cardBorderRadius: "8px",
      spacing: "16px",
    },
    boxed: {
      containerMaxWidth: "1200px",
      sidebarWidth: "260px",
      cardBorderRadius: "16px",
      spacing: "20px",
    },
  };

  return presets[layout?.containerMaxWidth || "wide"] || presets.wide;
}