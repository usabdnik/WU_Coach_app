
import React, { useState, useEffect, useCallback } from 'react';
import type { Student } from './types';
import api from './services/api';
import Header from './components/Header';
import StudentList from './components/StudentList';
import StudentDetailView from './components/StudentDetailView';

const App: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const data = await api.getStudents();
                setStudents(data);
            } catch (error) {
                console.error("Failed to fetch students", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const handleSelectStudent = useCallback((student: Student) => {
        setSelectedStudent(student);
    }, []);

    const handleBackToList = useCallback(() => {
        setSelectedStudent(null);
    }, []);
    
    const handleUpdateStudent = useCallback((updatedStudent: Student) => {
        setStudents(prevStudents => 
            prevStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s)
        );
        setSelectedStudent(updatedStudent); // also update the selected student state
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-screen"><p className="text-gray-500 dark:text-gray-400">Загрузка учеников...</p></div>;
        }

        if (selectedStudent) {
            return <StudentDetailView student={selectedStudent} onUpdateStudent={handleUpdateStudent} />;
        }

        return <StudentList students={students} onSelectStudent={handleSelectStudent} />;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
            <Header showBackButton={!!selectedStudent} onBack={handleBackToList} />
            <main className="max-w-3xl mx-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
