export type SnBlob = {
    id: string;
    name: string;
    data: string;
}

export type SnSource = {
    image: SnBlob[];
    audio: SnBlob[];
    text: SnBlob[];
}

export type SnPlayList = {
    id: string;
    image_id?: string;
    audio_id?: string;
    text_id?: string;
}

export type SnPlayListParse = {
    id: string;
    image?: SnBlob;
    audio?: SnBlob;
    text?: SnBlob;
}

export type SnConfig = {
    version: string;
    package_name: string;
    description: string;
    text_speed: number;
    src: SnSource;
    playlist: SnPlayList[];

    add(element: SnPlayList): void;
    remove(no: number): void;
    edit(no: number, newElement: SnPlayList): void;
    insert(no: number, newElement: SnPlayList): void;
    getSource(index: number): SnPlayListParse;
}

export function createSnConfig(title: string, description: string): SnConfig {
    const config: SnConfig = {
        version: '1.0.0',
        package_name: title,
        description,
        text_speed: 100,
        src: { image: [], audio: [], text: [] },
        playlist: [],
        add(element: SnPlayList): void {
            this.playlist.push(element);
        },
        remove(index: number): void {
            this.playlist = this.playlist.filter((_, no) => index !== no);
        },
        edit(index: number, newElement: SnPlayList): void {
            if (this.playlist[index] !== undefined) {
                this.playlist[index] = newElement;
            }
        },
        insert(index: number, newElement: SnPlayList): void {
            if (this.playlist[index] !== undefined) {
                this.playlist.splice(index, 0, newElement);
            }
        },
        getSource(index: number): SnPlayListParse {
            const playlist = this.playlist[index];
            if (playlist === undefined) {
                return { id: '', image: undefined, audio: undefined, text: undefined };
            }

            return {
                id: playlist.id,
                image: this.src.image.find((img) => img.id === playlist.image_id) || undefined,
                audio: this.src.audio.find((audio) => audio.id === playlist.audio_id) || undefined,
                text: this.src.text.find((text) => text.id === playlist.text_id) || undefined
            };
        }
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