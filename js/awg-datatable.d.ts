/**
 * AWG-UIKIT-RACING — DataTable type declarations
 * Author: AWGNET-RACING & AGENT AI TEAM
 */

export type RowId = string;

export interface AwgTableOptions {
    page?: number;
    per?: number[];
    search?: boolean;
    sort?: boolean;
    select?: boolean;
    info?: boolean;
    placeholder?: string;
    onBulk?: (ids: RowId[], table: AwgTable) => void;
}

export interface AwgTableRow {
    id: RowId;
    cells: string[];
    html: string;
}

export interface AwgTableState {
    q: string;
    sortCol: number;
    dir: number;
    page: number;
    size: number;
    sel: Set<RowId>;
}

export class AwgTable {
    static icon: string;
    constructor(target: HTMLTableElement | string, opts?: AwgTableOptions);
    t: HTMLTableElement;
    o: AwgTableOptions;
    st: AwgTableState;
    all: AwgTableRow[];
    read(): void;
    view(): AwgTableRow[];
    draw(): void;
    reload(rows: AwgTableRow[]): void;
    getSelected(): RowId[];
    setSearch(q: string): void;
    destroy(): void;
}

export function init(root?: ParentNode): void;
export const mount: (root?: ParentNode) => void;
