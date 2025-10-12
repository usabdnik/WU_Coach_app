
import React, { useState, useCallback } from 'react';
import { SyncIcon, ArrowLeftIcon } from './icons';

interface HeaderProps {
    showBackButton: boolean;
    onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ showBackButton, onBack }) => {
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = useCallback(() => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
        }, 2000);
    }, []);

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                {showBackButton && (
                    <button onClick={onBack} className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                )}
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Gym Coach</h1>
            </div>
            <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
                <SyncIcon className={`w-5 h-5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Синхронизация...' : 'Синхронизировать'}
            </button>
        </header>
    );
};

export default Header;
