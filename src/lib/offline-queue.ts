import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'jasmine-offline'
const STORE_NAME = 'pending-orders'

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
    },
  })
}

export async function queueOrder(order: Record<string, unknown>): Promise<void> {
  const db = await getDB()
  await db.add(STORE_NAME, { ...order, queued_at: Date.now() })
}

export async function getPendingOrders(): Promise<any[]> {
  const db = await getDB()
  return db.getAll(STORE_NAME)
}

export async function removePendingOrder(id: number): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

export async function flushQueue(
  submitFn: (order: Record<string, unknown>) => Promise<void>
): Promise<number> {
  const pending = await getPendingOrders()
  let flushed = 0
  for (const order of pending) {
    try {
      const { id, queued_at, ...orderData } = order
      await submitFn(orderData)
      await removePendingOrder(id)
      flushed++
    } catch {
      break
    }
  }
  return flushed
}
