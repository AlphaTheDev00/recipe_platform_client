// Memory fallback when localStorage is unavailable
let memoryStore = {};

const memoryStorage = {
  getItem(key) {
    return memoryStore[key] || null;
  },
  setItem(key, value) {
    memoryStore[key] = value;
    return true;
  },
  removeItem(key) {
    delete memoryStore[key];
    return true;
  },
  clear() {
    memoryStore = {};
    return true;
  },
  getAll() {
    return { ...memoryStore };
  },
};

export default memoryStorage;
