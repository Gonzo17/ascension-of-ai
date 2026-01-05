/**
 * Composable for translating parameter values that contain i18n keys.
 * Used for event titles/descriptions where params may reference translation keys.
 */
export function useTranslateParams() {
  const { t } = useI18n()

  /**
   * Translate param values that are i18n keys (e.g. 'events.values.victory' -> 'Sieg')
   */
  const translateParams = (params?: Record<string, string | number>): Record<string, string | number> => {
    if (!params) return {}
    return Object.fromEntries(
      Object.entries(params).map(([key, value]) => [
        key,
        typeof value === 'string' && value.startsWith('events.') ? t(value) : value
      ])
    )
  }

  /**
   * Translate a single value if it's an i18n key
   */
  const translateValue = (value: string, params?: Record<string, string | number>): string => {
    if (value.startsWith('events.')) {
      return t(value, params ?? {})
    }
    return value
  }

  return {
    translateParams,
    translateValue
  }
}
