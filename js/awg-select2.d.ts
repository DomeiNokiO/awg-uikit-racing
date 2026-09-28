/**
 * AWG-UIKIT-RACING — Select2-style type declarations
 * Author: AWGNET-RACING & AGENT AI TEAM
 */

export interface AwgSelectItem {
    value: string;
    text: string;
    group?: string | null;
    disabled?: boolean;
    extra?: string;
}

export interface AwgSelectOptions {
    multiple?: boolean;
    placeholder?: string;
    allowClear?: boolean;
    tags?: boolean;
    max?: number;
    minChars?: number;
    search?: boolean;
    source?: (query: string, cb: (list: AwgSelectItem[]) => void) => void;
    formatter?: (item: AwgSelectItem) => string;
    onChange?: (values: string[]) => void;
    noResultText?: string;
}

export class AwgSelect {
    constructor(select: HTMLSelectElement, opts?: AwgSelectOptions);
    el: HTMLSelectElement;
    wrap: HTMLElement;
    open(): void;
    close(): void;
    getValue(): string | string[];
    setValue(v: string | string[] | null): void;
    setOptions(items: AwgSelectItem[]): void;
    refresh(): void;
    clear(): void;
    destroy(): void;
}

export function create(
    elOrSelect: HTMLSelectElement | string,
    opts?: AwgSelectOptions
): AwgSelect;

export const mount: (root?: ParentNode) => void;
