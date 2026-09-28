/**
 * AWG-UIKIT-RACING — Charts type declarations
 * Author: AWGNET-RACING & AGENT AI TEAM
 */

export type ChartType = 'line' | 'area' | 'bar' | 'donut' | 'gauge' | 'sparkline';

export interface ChartOptions {
    type?: ChartType;
    height?: number;
    labels?: string[];
    series?: number[][];
    names?: string[] | null;
    colors?: string[] | null;
    fill?: boolean;
    area?: boolean;
    smooth?: boolean;
    yFmt?: ((v: number) => string) | null;
    unit?: string;
    legend?: boolean;
    tooltip?: boolean;
    max?: number | null;
    donut?: boolean;
    total?: string | null;
    gaugeMax?: number;
    gaugeZones?: [number, number];
    value?: number;
    barHorizontal?: boolean;
}

export interface ChartDataInput {
    labels?: string[];
    series?: number[][];
}

export class Chart {
    constructor(target: HTMLElement | string, opts?: ChartOptions);
    el: HTMLElement;
    o: ChartOptions;
    update(data: number[] | number[][] | ChartDataInput | string | null, extra?: ChartOptions): void;
    render(opts?: ChartOptions): void;
    destroy(): void;
}

export function init(root?: ParentNode): void;
export const mount: (root?: ParentNode) => void;
