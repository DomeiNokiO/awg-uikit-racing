/**
 * AWG-UIKIT-RACING — Maps adapter type declarations
 * Author: AWGNET-RACING & AGENT AI TEAM
 */

export type MapProvider = 'leaflet' | 'gmaps' | 'maplibre';

export interface AwgMapMarker {
    lat: number;
    lng: number;
    title?: string;
    popup?: string;
}

export interface AwgMapOptions {
    provider?: MapProvider;
    lat?: number;
    lng?: number;
    zoom?: number;
    markers?: AwgMapMarker[];
    fit?: boolean;
    onReady?: (map: AwgMap) => void;
    tileUrl?: string;
    attribution?: string;
    style?: object | string;
}

export class AwgMap {
    constructor(root: HTMLElement | string, opts?: AwgMapOptions);
    el: HTMLElement;
    o: AwgMapOptions;
    map: any;
    markers: any[];
    addMarker(m: AwgMapMarker): void;
    pan(lat: number, lng: number, zoom?: number): void;
}

export const mount: (root?: ParentNode) => void;
