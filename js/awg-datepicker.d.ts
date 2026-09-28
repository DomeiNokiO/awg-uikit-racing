/**
 * AWG-UIKIT-RACING — Datepicker type declarations
 * Author: AWGNET-RACING & AGENT AI TEAM
 */

export interface AwgDateOptions {
    min?: string | null;
    max?: string | null;
}

export type DateListener = (detail: { iso: string }) => void;

export class AwgDate {
    static DAY_HEAD: string[];
    static MON: string[];
    constructor(input: HTMLInputElement | string, opts?: AwgDateOptions);
    i: HTMLInputElement;
    o: AwgDateOptions;
    pop: HTMLElement | null;
    get iso(): string | null;
    get date(): Date | null;
    set(v: Date | string | null, silent?: boolean): void;
    limits(): { min: string | null | undefined; max: string | null | undefined };
    open(): void;
    close(): void;
}

export function iso(input: HTMLInputElement | string): string | null;
export const mount: (root?: ParentNode) => void;
