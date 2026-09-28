/**
 * AWG-UIKIT-RACING — Widgets type declarations
 * Author: AWGNET-RACING & AGENT AI TEAM
 */

export interface AwgWizardOptions {
    validate?: boolean;
    onDone?: (wizard: AwgWizard) => void;
    onChange?: (step: number, wizard: AwgWizard) => void;
}

export class AwgWizard {
    constructor(root: HTMLElement | string, opts?: AwgWizardOptions);
    r: HTMLElement;
    steps: HTMLElement[];
    panes: HTMLElement[];
    n: number;
    valid(): boolean;
    goto(i: number): void;
    next(): void;
    prev(): void;
    finish(): void;
}

export interface AwgTreeOptions {
    onChange?: (checked: string[], tree: AwgTree) => void;
}

export class AwgTree {
    constructor(root: HTMLElement | string, opts?: AwgTreeOptions);
    r: HTMLElement;
    checked(): string[];
    set(ids: string[]): void;
}

export interface AwgKanbanOptions {
    onChange?: (columns: Record<string, string[]>) => void;
}

export interface AwgKanbanState {
    [columnId: string]: string[];
}

export class AwgKanban {
    constructor(root: HTMLElement | string, opts?: AwgKanbanOptions);
    state(): AwgKanbanState;
}

export interface AwgPaletteItem {
    id: string;
    label: string;
    shortcut?: string;
    icon?: string;
    action?: () => void;
    href?: string;
}

export interface AwgPaletteAPI {
    items: AwgPaletteItem[];
    init(items: AwgPaletteItem[]): void;
    open(): void;
    close(): void;
}

export class AwgLightbox {
    constructor(root?: HTMLElement | string | null, opts?: { selector?: string });
    open(src: string, alt?: string): void;
    close(): void;
}

export const Palette: AwgPaletteAPI;
export function init(items?: AwgPaletteItem[]): void;
export const mount: (root?: ParentNode) => void;
