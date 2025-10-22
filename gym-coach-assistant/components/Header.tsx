
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
    const [pendingCount, setPendingCount] = useState(0);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const loadLastSync = async () => {
            const timestamp = await api.getLastSync();
            setLastSync(timestamp);
        };
        loadLastSync();
        updatePendingCount();

        // Check online status periodically
        const intervalId = setInterval(() => {
            setIsOnline(navigator.onLine);
            updatePendingCount();
        }, 5000);

        // Event listeners for online/offline
        window.addEventListener('online', () => setIsOnline(true));
        window.addEventListener('offline', () => setIsOnline(false));

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('online', () => setIsOnline(true));
            window.removeEventListener('offline', () => setIsOnline(false));
        };
    }, []);

    const updatePendingCount = () => {
        const count = api.getPendingChangesCount();
        setPendingCount(count);
    };

    const handleSync = useCallback(async () => {
        if (!navigator.onLine) {
            alert('❌ Нет подключения к интернету');
            return;
        }

        setIsSyncing(true);
        try {
            await api.syncWithServer();
            const timestamp = await api.getLastSync();
            setLastSync(timestamp);
            updatePendingCount();
            alert('✅ Синхронизация завершена успешно!');
        } catch (error) {
            console.error('Sync failed:', error);
            alert('❌ Ошибка синхронизации: ' + (error as Error).message);
        } finally {
            setIsSyncing(false);
        }
    }, []);

    const getSyncButtonText = () => {
        if (isSyncing) return 'Синхронизация...';
        if (pendingCount > 0) return `Синхронизировать (${pendingCount})`;
        return 'Синхронизировать';
    };

    const getSyncButtonClass = () => {
        const baseClass = "flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200";

        if (!isOnline || isSyncing) {
            return `${baseClass} bg-gray-400 cursor-not-allowed`;
        }

        if (pendingCount > 0) {
            return `${baseClass} bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500 animate-pulse`;
        }

        return `${baseClass} bg-blue-600 hover:bg-blue-700`;
    };

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                {showBackButton && (
                    <button onClick={onBack} className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                )}
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Gym Coach</h1>
                {!isOnline && (
                    <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                        Офлайн
                    </span>
                )}
            </div>
            <div className="flex flex-col items-end">
                <button
                    onClick={handleSync}
                    disabled={!isOnline || isSyncing}
                    className={getSyncButtonClass()}
                >
                    <SyncIcon className={`w-5 h-5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                    {getSyncButtonText()}
                </button>
                {lastSync && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(lastSync).toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                )}
            </div>
        </header>
    );
};

export default Header;
