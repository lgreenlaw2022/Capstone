import React from "react";
import styles from "../styles/Unit.module.css";
import { getModulesInUnit } from "../api/api";
import { useEffect, useState } from "react";
import Module from "./Module";
import { ModuleType } from "../types/ModuleTypes";
import { useRouter } from "next/router";

interface UnitProps {
    unitId: number;
    title: string;
}

interface ApiModule {
    id: number;
    title: string;
    module_type: string;
    order: number;
    isOpen: boolean;
}

interface Module {
    id: number;
    title: string;
    type: ModuleType;
    order: number;
    isOpen: boolean;
}

export default function Unit({ unitId, title }: UnitProps) {
    const router = useRouter();
    const [modules, setModules] = useState<Module[]>([]);
    const [completionPercentage, setCompletionPercentage] = useState<number>(0);

    const fetchModules = async (unitId: number) => {
        try {
            if (unitId) {
                const data = await getModulesInUnit(Number(unitId));
                if (data.modules) {
                    // Map the module_type string to the ModuleType enum
                    const mappedModules = data.modules.map((module: ApiModule) => ({
                        ...module,
                        type: module.module_type as ModuleType,
                    }));
                    setModules(mappedModules);
                } else {
                    console.error("Modules data is undefined");
                }
                // Round the completion percentage to an integer
                setCompletionPercentage(Math.round(data.completion_percentage));
            }
        } catch (error) {
            console.error("Error fetching modules:", error);
        }
    };

    const handleReviewClick = () => {
        router.push(`/review/${unitId}`);
    };

    useEffect(() => {
        fetchModules(unitId);
    }, [unitId]);

    return (
        <div className={styles.unitContainer}>
            <div className={styles.unitTitleContainer}>
                <div className={styles.unitHeader}>
                    <h2 className={styles.unitTitle}>{title}</h2>
                </div>
                <div className={styles.unitCompletion}>
                    {completionPercentage}% completed
                </div>
                {/* Show unit review button for completed units */}
                {completionPercentage === 100 && (
                    <button
                        type="button"
                        className={styles.reviewButton}
                        onClick={handleReviewClick}
                    >
                        Review
                    </button>
                )}
            </div>
            <div className={styles.unitModules}>
                {modules.map((module) => (
                    <Module
                        key={module.id}
                        id={module.id}
                        type={module.type}
                        isOpen={module.isOpen}
                    />
                ))}
            </div>
        </div>
    );
}
