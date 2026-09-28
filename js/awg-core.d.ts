/**
 * AWG-UIKIT-RACING — Core JS type declarations
 * Author: AWGNET-RACING & AGENT AI TEAM
 */

declare namespace Awg {
    type Theme = 'light' | 'dark';
    type ToastType = 'info' | 'ok' | 'bad' | 'warn';

    interface ThemeAPI {
        get(): Theme;
        set(t: Theme): void;
        toggle(): void;
        init(): void;
    }

    interface SidebarAPI {
        open(): void;
        close(): void;
        toggle(): void;
        init(): void;
    }

    interface ModalAPI {
        open(id: string): void;
        close(id: string): void;
        init(): void;
    }

    interface DrawerAPI {
        open(id: string): void;
        close(id: string): void;
        init(): void;
    }

    interface DropdownAPI {
        closeAll(except?: HTMLElement | null): void;
        init(): void;
    }

    interface PopoverAPI {
        init(): void;
    }

    interface TabsAPI {
        init(): void;
    }

    interface AccordionAPI {
        init(): void;
    }

    interface SteppersAPI {
        init(): void;
    }

    interface TagInputResult {
        add(val: string): void;
        get(): string[];
        clear(): void;
    }

    interface TagInputsAPI {
        init(): void;
    }

    interface FormAPI {
        showError(input: HTMLElement, msg: string): void;
        clearErrors(form: HTMLFormElement): void;
        validate(form: HTMLFormElement): boolean;
        values(form: HTMLFormElement): Record<string, string | string[]>;
        init(): void;
    }

    interface AwgStatic {
        esc(s: unknown): string;
        rupiah(v: unknown, prefix?: string): string;
        num(v: unknown): string;
        $<T extends HTMLElement = HTMLElement>(sel: string, root?: ParentNode | null): T | null;
        $$<T extends HTMLElement = HTMLElement>(sel: string, root?: ParentNode | null): T[];
        theme: ThemeAPI;
        sidebar: SidebarAPI;
        toast(msg: string, type?: ToastType, ms?: number): HTMLElement;
        modal: ModalAPI;
        trapFocus(root: HTMLElement): void;
        untrapFocus(root: HTMLElement): void;
        drawer: DrawerAPI;
        confirm(title: string, text: string, onYes?: () => void, opts?: ConfirmOptions): void;
        dropdown: DropdownAPI;
        popover: PopoverAPI;
        tabs: TabsAPI;
        accordion: AccordionAPI;
        steppers: SteppersAPI;
        tagInput(box: HTMLElement, opts?: TagInputOptions): TagInputResult;
        tagInputs: TagInputsAPI;
        form: FormAPI;
        btnLoading(btn: HTMLButtonElement, on: boolean, label?: string): void;
    }

    interface ConfirmOptions {
        yes?: string;
        no?: string;
        danger?: boolean;
    }

    interface TagInputOptions {
        max?: number;
        onChange?: (values: string[]) => void;
    }
}

declare const Awg: Awg.AwgStatic;

export = Awg;
export as namespace Awg;
