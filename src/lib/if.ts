export const ifExp = <T, F>(cond: boolean, t: T, f: F): T | F => {
  if (cond) {
    return t
  } else {
    return f
  }
}
