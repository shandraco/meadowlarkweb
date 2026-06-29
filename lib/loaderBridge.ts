type Listener = () => void;
const listeners = new Set<Listener>();

export const loaderBridge = {
  addListener(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  complete() {
    listeners.forEach(l => l());
    listeners.clear();
  },
};
