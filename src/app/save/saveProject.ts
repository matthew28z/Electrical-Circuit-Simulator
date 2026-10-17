interface CircuitData {
    name: string
    index: number //must be >= 0
    circuit: string
}

interface Project {
    name: string
    data: CircuitData[]
}

export function saveProject(): void {
    
}