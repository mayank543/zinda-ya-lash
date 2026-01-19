
import { create } from 'zustand'

interface StatusPageModalStore {
    isOpen: boolean
    pageToEdit?: any
    onOpen: (page?: any) => void
    onClose: () => void
}

export const useStatusPageModal = create<StatusPageModalStore>((set) => ({
    isOpen: false,
    pageToEdit: undefined,
    onOpen: (page) => set({ isOpen: true, pageToEdit: page }),
    onClose: () => set({ isOpen: false, pageToEdit: undefined }),
}))
