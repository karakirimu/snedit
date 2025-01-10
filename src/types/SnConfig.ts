export type SnElement = {
    no: number;
    image: string;
    audio?: string;
    text?: string;
}

export type SnConfig = {
    version: string;
    package_name: string;
    description: string;
    text_speed: number;
    data: SnElement[];

    addElement(element: SnElement): void;
    removeElement(no: number): void;
    editElement(no: number, newElement: SnElement): void;
    insertElement(no: number, newElement: SnElement): void;
}

export function createSnConfig(title: string, description: string, data: SnElement[]): SnConfig {
    const config: SnConfig = {
        version: '1.0.0',
        package_name: title,
        description,
        text_speed: 100,
        data,
        addElement(element: SnElement): void {
            this.data.push(element);
        },
        removeElement(no: number): void {
            this.data = this.data.filter(element => element.no !== no);
        },
        editElement(no: number, newElement: SnElement): void {
            const index = this.data.findIndex(element => element.no === no);
            if (index !== -1) {
                this.data[index] = newElement;
            }
        },
        insertElement(no: number, newElement: SnElement): void {
            const index = this.data.findIndex(element => element.no === no);
            if (index !== -1) {
                this.data.splice(index, 0, newElement);
            }
        },
    };
    return config;
}

export const exportSnConfig = (config: SnConfig) => {
    const configData = JSON.stringify(config, null, 2);
    const blob = new Blob([configData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    a.click();
    URL.revokeObjectURL(url);
}

export const importSnConfig = (onImport: (config: SnConfig) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const config : SnConfig = JSON.parse(reader.result as string);
                onImport(config);
            };
            reader.readAsText(file);
        }
    };
    input.click();
}