const DATABASE_NAME = 'my-routine'
const STORE_NAME = 'application-data'
const DATA_KEY = 'routine'
const LEGACY_KEY = 'my-routine-data'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function readDatabase<T>(): Promise<T | undefined> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const request = transaction.objectStore(STORE_NAME).get(DATA_KEY)
    request.onsuccess = () => resolve(request.result as T | undefined)
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => database.close()
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

export async function saveRoutineData<T>(data: T): Promise<void> {
  try {
    const database = await openDatabase()
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite')
      transaction.objectStore(STORE_NAME).put(data, DATA_KEY)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
    database.close()
  } catch {
    try {
      localStorage.setItem(LEGACY_KEY, JSON.stringify(data))
    } catch {
      // Storage may be unavailable in private browsing or when the quota is exhausted.
    }
  }
}

export async function loadRoutineData<T>(fallback: T): Promise<T> {
  try {
    const stored = await readDatabase<T>()
    if (stored !== undefined) return stored
  } catch {
    // Continue with the previous localStorage format when IndexedDB is unavailable.
  }

  try {
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy) {
      const migrated = JSON.parse(legacy) as T
      await saveRoutineData(migrated)
      return migrated
    }
  } catch {
    // Invalid legacy data is ignored; the app starts with an empty state.
  }

  return fallback
}