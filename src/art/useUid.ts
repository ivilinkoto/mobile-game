import { useId } from 'react';

/** A gradient-id prefix that is unique per component instance and safe in url(#…). */
export function useUid(prefix = 'g'): string {
  return prefix + useId().replace(/[^a-zA-Z0-9]/g, '');
}
