interface StorageItem {
  key: string;
  value: any;
  expiry?: number;
}

const put = (item: StorageItem, backend: Storage): void => {
  const now = new Date();
  const expiry =
    item.expiry === -1 ? -1 : now.getTime() + (item.expiry || 86400000);
  backend.setItem(item.key, JSON.stringify({ value: item.value, expiry }));
};

const get = (key: string, backend: Storage): any | undefined => {
  const value = backend.getItem(key);
  const now = new Date().getTime();
  if (value) {
    const decodedItem = JSON.parse(value);
    if (decodedItem.expiry !== -1 && decodedItem.expiry < now) {
      backend.removeItem(key);
    } else {
      return decodedItem.value;
    }
  }
};

export const Local = {
  put: (item: StorageItem): void => put(item, window.localStorage),
  get: (key: string): any | undefined => get(key, window.localStorage),
};

export const Session = {
  put: (item: StorageItem): void => put(item, window.sessionStorage),
  get: (key: string): any | undefined => get(key, window.sessionStorage),
};
