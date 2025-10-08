'use client';
import { useAppStore } from '@/hooks/useAppStore';
import { DayPicker } from './pickers/DayPicker';
import { MonthPicker } from './pickers/MonthPicker';
import { YearPicker } from './pickers/YearPicker';
import { SeasonPicker } from './pickers/SeasonPicker';

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