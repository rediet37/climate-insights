'use client';

import { useAppStore } from '@/hooks/useAppStore';
import { ToggleSwitch } from '../shared/ToggleSwitch';
import { useState } from 'react';
import { infoContent } from '@/lib/info-content';
import { Modal } from '../shared/Modal';

// Data structure for sidebar items
const categories = [
    {
        id: 'rainfall',
        name: 'Rainfall',
        subcategories: [
            { id: 'daily', name: 'Daily' },
            { id: 'monthly', name: 'Monthly' },
            { id: 'seasonal', name: 'Seasonal' },
            { id: 'annual', name: 'Annual' },
            { id: 'climatology', name: 'Climatology' },
        ],
    },
    {
        id: 'temperature',
        name: 'Temperature',
        subcategories: [
            { id: 'daily', name: 'Daily' },
            { id: 'monthly', name: 'Monthly' },
            { id: 'seasonal', name: 'Seasonal' },
            { id: 'annual', name: 'Annual' },
            { id: 'climatology', name: 'Climatology' },
        ],
    },
    {
        id: 'drought',
        name: 'Drought',
        subcategories: [
            { id: 'cdd', name: 'CDD' },
            { id: 'cwd', name: 'CWD' },
            { id: 'spi', name: 'SPI' },
            { id: 'spei', name: 'SPEI' },
        ],
    },
];

export function Sidebar() {
    const [openCategory, setOpenCategory] = useState<string | null>(''); 
    const { activeCategory, activeSubcategory, actions } = useAppStore();
    const [modalInfo, setModalInfo] = useState<{ isOpen: boolean; contentKey: string }>({
        isOpen: false,
        contentKey: ''
    });

    const handleToggle = (cat: 'rainfall' | 'temperature' | 'drought', sub: string) => {
        if (activeCategory === cat && activeSubcategory === sub) {
            actions.reset();
        } else {
            actions.setActive(cat, sub as any); 
        }
    };

    const handleCategoryClick = (categoryId: string) => {
        setOpenCategory(openCategory === categoryId ? null : categoryId);
    };

    const handleInfoClick = (e: React.MouseEvent, categoryId: string, subcategoryId: string) => {
        e.stopPropagation(); // Prevent the toggle from being triggered
        const contentKey = `${categoryId}-${subcategoryId}`;
        if (infoContent[contentKey]) {
            setModalInfo({
                isOpen: true,
                contentKey
            });
        }
    };

    const closeModal = () => {
        setModalInfo({ ...modalInfo, isOpen: false });
    };

    const selectedCategory = categories.find(cat => cat.id === openCategory);

    return (
        <div className="flex bg-white shadow-lg h-full overflow-hidden flex-shrink-0 z-20">
            {/* Main Categories Column */}
            <div className="w-64 p-4 border-r border-gray-200">
                <h3 className="text-xl font-bold mb-4">Climate Insights</h3>
                <div className="space-y-2">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id)}
                            className={`w-full text-left font-semibold p-3 rounded hover:bg-gray-100 transition-colors flex justify-between items-center ${
                                openCategory === cat.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                        >
                            <span>{cat.name}</span>
                            <svg
                                className={`w-4 h-4 transition-transform ${openCategory === cat.id ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    ))}
                </div>
            </div>

            {/* Subcategories Column */}
            {selectedCategory && (
                <div className="w-56 p-4 bg-gray-50 border-r border-gray-200 overflow-y-auto">
                    <h4 className="text-lg font-semibold mb-4 text-gray-800">
                        {selectedCategory.name}
                    </h4>
                    <div className="space-y-3">
                        {selectedCategory.subcategories.map(sub => (
                            <div key={sub.id} className="flex items-center justify-between p-2 rounded hover:bg-white transition-colors">
                                <label htmlFor={`${selectedCategory.id}-${sub.id}`} className="text-gray-700 cursor-pointer flex-1 flex items-center">
                                    {sub.name}
                                    {infoContent[`${selectedCategory.id}-${sub.id}`] && (
                                        <button 
                                            className="ml-2 text-gray-400 hover:text-green-500 focus:outline-none" 
                                            onClick={(e) => handleInfoClick(e, selectedCategory.id, sub.id)}
                                            aria-label={`Information about ${sub.name}`}
                                        >
                                            <svg 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                className="h-4 w-4" 
                                                fill="none" 
                                                viewBox="0 0 24 24" 
                                                stroke="currentColor"
                                            >
                                                <path 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    strokeWidth={2} 
                                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </label>
                                <ToggleSwitch
                                    id={`${selectedCategory.id}-${sub.id}`}
                                    checked={activeCategory === selectedCategory.id && activeSubcategory === sub.id}
                                    onChange={() => handleToggle(selectedCategory.id as any, sub.id)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Info Modal */}
            {modalInfo.isOpen && infoContent[modalInfo.contentKey] && (
                <Modal 
                    isOpen={modalInfo.isOpen} 
                    onClose={closeModal}
                    title={infoContent[modalInfo.contentKey].title}
                >
                    {infoContent[modalInfo.contentKey].content}
                </Modal>
            )}
        </div>
    );
}