'use client';

import { useAppStore } from '@/hooks/useAppStore';
import { ToggleSwitch } from '../shared/ToggleSwitch';
import { useEffect, useRef, useState } from 'react';
import { infoContent } from '@/lib/info-content';
import { Modal } from '../shared/Modal';
import { WiRain, WiThermometer } from 'react-icons/wi';
import { IoSunnyOutline } from "react-icons/io5";

const categories = [
    {
        id: 'rainfall',
        name: 'Rainfall',
        icon: <WiRain size={28} />,
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
        icon: <WiThermometer size={28} />,
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
        icon: <IoSunnyOutline size={28} />,
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
    const { activeCategory, activeSubcategory, sidebarNudgeTs, actions } = useAppStore();
    const headerRef = useRef<HTMLHeadingElement>(null);
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

    // When nudged (region-first Analyse), ensure the sidebar draws attention
    useEffect(() => {
        if (!sidebarNudgeTs) return;
        // Open the first category list if none is open
        if (!openCategory && categories.length > 0) {
            setOpenCategory(categories[0].id);
        }
    }, [sidebarNudgeTs]);

    return (
        <div className="flex bg-white shadow-xl h-full overflow-hidden flex-shrink-0 z-20 rounded-r-xl">
            {/* Main Categories Column*/}
            <div className="w-24 p-2 border-r border-gray-200 flex flex-col items-center space-y-4 bg-gray-50">
                <h3 ref={headerRef} className="text-lg font-semibold mb-2">Climate Insights <hr className="my-3 border-gray-200" /></h3>

                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        className={`w-full flex flex-col items-center p-3 rounded-xl transition-all duration-200 focus:outline-none ${
                            openCategory === cat.id 
                                ? 'bg-gradient-to-r from-green-50 to-blue-50 text-blue-600 shadow-md transform scale-105' 
                                : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        title={cat.name}
                    >
                        <div className={`${openCategory === cat.id ? 'text-blue-500' : 'text-gray-500'}`}>
                            {cat.icon}
                        </div>
                        <span className="text-xs mt-2 font-semibold">{cat.name}</span>
                    </button>
                ))}
            </div>

            {/* Subcategories Column */}
            {selectedCategory && (
                <div className="w-64 p-5 bg-white border-r border-gray-100 overflow-y-auto">
                    <h4 className="text-xl font-bold my-3 text-gray-700 flex items-center">
                        <span className="mr-2">{selectedCategory.icon}</span>
                        {selectedCategory.name}
                        <hr className="my-4 border-gray-200" />
                    </h4>
                    <div className="space-y-3">
                        {selectedCategory.subcategories.map(sub => (
                            <div 
                                key={sub.id} 
                                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200
                                ${activeCategory === selectedCategory.id && activeSubcategory === sub.id
                                    ? 'bg-gradient-to-r from-blue-50 to-green-50 shadow-sm'
                                    : 'hover:bg-gray-50'
                                }`}
                            >
                                <label 
                                    htmlFor={`${selectedCategory.id}-${sub.id}`} 
                                    className={`cursor-pointer flex-1 flex items-center font-medium
                                    ${activeCategory === selectedCategory.id && activeSubcategory === sub.id
                                        ? 'text-blue-600'
                                        : 'text-gray-700'
                                    }`}
                                >
                                    {sub.name}
                                    {infoContent[`${selectedCategory.id}-${sub.id}`] && (
                                        <button 
                                            className={`ml-2 focus:outline-none rounded-full p-1 hover:bg-white transition-colors
                                            ${activeCategory === selectedCategory.id && activeSubcategory === sub.id
                                                ? 'text-blue-500 hover:text-blue-700'
                                                : 'text-gray-400 hover:text-blue-500'
                                            }`}
                                            onClick={(e) => handleInfoClick(e, selectedCategory.id, sub.id)}
                                            aria-label={`Information about ${sub.name}`}
                                        >
                                            <svg 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                className="h-5 w-5" 
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