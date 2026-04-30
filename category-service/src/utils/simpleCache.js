class SimpleCache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const data = this.store.get(key);

    if (!data) return null;

    if (Date.now() > data.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return data.value;
  }

  set(key, value, ttlMs) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

module.exports = {
  SimpleCache,
};
