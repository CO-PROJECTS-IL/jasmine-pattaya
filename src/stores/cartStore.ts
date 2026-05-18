import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  dishId: string
  nameHe: string
  nameEn: string
  nameTh: string
  price: number
  quantity: number
  notes: string
}

interface CartState {
  items: CartItem[]
  tableNumber: number | null
  orderNotes: string
  addItem: (item: Omit<CartItem, 'quantity' | 'notes'> & { quantity?: number; notes?: string }) => void
  removeItem: (dishId: string) => void
  updateQuantity: (dishId: string, quantity: number) => void
  setTable: (table: number | null) => void
  setNotes: (notes: string) => void
  clear: () => void
  getTotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableNumber: null,
      orderNotes: '',

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.dishId === item.dishId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.dishId === item.dishId
                  ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                  : i
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                dishId: item.dishId,
                nameHe: item.nameHe,
                nameEn: item.nameEn,
                nameTh: item.nameTh,
                price: item.price,
                quantity: item.quantity || 1,
                notes: item.notes || '',
              },
            ],
          }
        })
      },

      removeItem: (dishId) => {
        set((state) => ({
          items: state.items.filter((i) => i.dishId !== dishId),
        }))
      },

      updateQuantity: (dishId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(dishId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.dishId === dishId ? { ...i, quantity } : i
          ),
        }))
      },

      setTable: (table) => set({ tableNumber: table }),

      setNotes: (notes) => set({ orderNotes: notes }),

      clear: () => set({ items: [], orderNotes: '' }),

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },
    }),
    {
      name: 'jasmine-cart',
    }
  )
)
