/**
 * AWG-UIKIT-RACING — bundled ESM/CJS entry type declarations
 * Author: AWGNET-RACING & AGENT AI TEAM
 */

import type { AwgStatic, Theme, ToastType, ConfirmOptions, TagInputOptions, TagInputResult } from './awg-core';
import type { AwgSelect, AwgSelectItem, AwgSelectOptions } from './awg-select2';
import type { Chart, ChartOptions, ChartDataInput, ChartType } from './awg-charts';
import type { AwgTable, AwgTableOptions, AwgTableRow, RowId } from './awg-datatable';
import type { AwgDate, AwgDateOptions } from './awg-datepicker';
import type { AwgWizard, AwgWizardOptions, AwgTree, AwgTreeOptions, AwgKanban, AwgKanbanOptions, AwgKanbanState, AwgPaletteItem, AwgPaletteAPI, AwgLightbox } from './awg-widgets';
import type { AwgMap, AwgMapOptions, AwgMapMarker, MapProvider } from './awg-maps';

export { AwgStatic, Theme, ToastType, ConfirmOptions, TagInputOptions, TagInputResult };
export { AwgSelect, AwgSelectItem, AwgSelectOptions };
export { Chart, ChartOptions, ChartDataInput, ChartType };
export { AwgTable, AwgTableOptions, AwgTableRow, RowId };
export { AwgDate, AwgDateOptions };
export { AwgWizard, AwgWizardOptions, AwgTree, AwgTreeOptions, AwgKanban, AwgKanbanOptions, AwgKanbanState, AwgPaletteItem, AwgPaletteAPI, AwgLightbox };
export { AwgMap, AwgMapOptions, AwgMapMarker, MapProvider };

declare const Awg: AwgStatic;
export { Awg };

interface AwgUIKit {
    Awg: AwgStatic;
    AwgSelect: typeof AwgSelect;
    AwgChart: typeof Chart;
    AwgTable: typeof AwgTable;
    AwgDate: typeof AwgDate;
    AwgWizard: typeof AwgWizard;
    AwgTree: typeof AwgTree;
    AwgPalette: AwgPaletteAPI;
    AwgKanban: typeof AwgKanban;
    AwgLightbox: typeof AwgLightbox;
    AwgMap: typeof AwgMap;
    AwgToast: (msg: string, type?: ToastType, ms?: number) => HTMLElement;
    AwgConfirm: (title: string, text: string, onYes?: () => void, opts?: ConfirmOptions) => void;
}

declare const AwgUIKit: AwgUIKit;
export default AwgUIKit;
