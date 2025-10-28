// Chooses the appropriate picker UI (day/month/season/year) for the active subcategory.
'use client';
import { useAppStore } from '@/hooks/useAppStore';
import { DayPicker } from './pickers/DayPicker';
import { MonthPicker } from './pickers/MonthPicker';
import { YearPicker } from './pickers/YearPicker';
import { SeasonPicker } from './pickers/SeasonPicker';

/**
 * RasterPickerControl
 * Switches between pickers based on activeSubcategory.
 * The selected value is stored in `useAppStore().selectedKey` by each picker.
 */
export const RasterPickerControl = () => {
    const { activeSubcategory } = useAppStore();

    switch (activeSubcategory) {
        case 'daily':
        case 'cdd':
        case 'cwd':
            return <DayPicker />;
        case 'monthly':
        case 'spi': 
        case 'spei': 
            return <MonthPicker />;
        case 'annual':
            return <YearPicker />;
        case 'seasonal':
            return <SeasonPicker />;
        default:
            return null;
    }
};