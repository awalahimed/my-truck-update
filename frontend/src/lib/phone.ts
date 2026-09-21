export function normalizeEthiopianPhone(input: string): { ok: boolean; e164?: string; local?: string } {
  if (!input) return { ok: false }
  const digits = input.replace(/[^0-9+]/g, '')

  let local = ''
  if (digits.startsWith('+251')) {
    local = digits.slice(4)
  } else if (digits.startsWith('251')) {
    local = digits.slice(3)
  } else if (digits.startsWith('0')) {
    local = digits.slice(1)
  } else {
    local = digits
  }

  if (!/^[79][0-9]{8}$/.test(local)) {
    return { ok: false }
  }
  return { ok: true, e164: `+251${local}`, local }
}


