
import React, { useState, useCallback, useEffect } from 'react';
import { SyncIcon, ArrowLeftIcon } from './icons';
import api from '../services/api';

interface HeaderProps {
    showBackButton: boolean;
    onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ showBackButton, onBack }) => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);

    useEffect(() => {
        const loadLastSync = async () => {
            const timestamp = await api.getLastSync();
            setLastSync(timestamp);
        };
        loadLastSync();
    }, []);

    const handleSync = useCallback(async () => {
        setIsSyncing(true);
        try {
            await api.syncWithServer();
            const timestamp = await api.getLastSync();
            setLastSync(timestamp);
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setIsSyncing(false);
        }
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
            <div className="flex flex-col items-end">
                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                    <SyncIcon className={`w-5 h-5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Синхронизация...' : 'Синхронизировать'}
                </button>
                {lastSync && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Синхр: {new Date(lastSync).toLocaleString('ru-RU')}
                    </p>
                )}
            </div>
        </header>
    );
};

export default Header;
