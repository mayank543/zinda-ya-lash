import { create } from 'zustand'

interface MonitorModalStore {
    isOpen: boolean
    monitorToEdit: any | null
    onOpen: (monitor?: any) => void
    onClose: () => void
}

export const useMonitorModal = create<MonitorModalStore>((set) => ({
    isOpen: false,
    monitorToEdit: null,
    onOpen: (monitor = null) => set({ isOpen: true, monitorToEdit: monitor }),
    onClose: () => set({ isOpen: false, monitorToEdit: null }),
}))
