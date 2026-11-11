// Hands a file picked on the home page to /cotizar across a client-side navigation.
let pending: File | null = null;

export const setPendingFile = (f: File) => (pending = f);

export function takePendingFile() {
  const f = pending;
  pending = null;
  return f;
}
