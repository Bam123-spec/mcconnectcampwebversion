declare module 'react-native-zeroconf' {
    import { EventEmitter } from 'events';

    export interface Service {
        name: string;
        fullName: string;
        addresses: string[];
        host: string;
        port: number;
        txt: { [key: string]: any };
    }

    export default class Zeroconf extends EventEmitter {
        constructor(props?: any);
        scan(type: string, protocol: string, domain: string): void;
        stop(): void;
        publishService(type: string, protocol: string, domain: string, name: string, port: number, txt?: { [key: string]: any }): void;
        unpublishService(name: string): void;
        removeDeviceListeners(): void;
        addDeviceListeners(): void;
        on(event: 'start' | 'stop' | 'update', listener: () => void): this;
        on(event: 'found' | 'resolved' | 'remove', listener: (name: string | Service) => void): this;
        on(event: 'error', listener: (err: any) => void): this;
    }
}
