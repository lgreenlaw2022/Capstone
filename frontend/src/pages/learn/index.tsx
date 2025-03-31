import React, { useEffect, useState } from 'react';
import Unit from '../../components/Unit';

import { getUnitsInPrepCourse } from '../../api/api';

interface UnitData {
    id: number;
    title: string;
}

export default function Learn() {
    const [units, setUnits] = useState<UnitData[]>([]);

    // fetch the units in the prep course on component mount (eg. 'Hash Maps')
    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const units = await getUnitsInPrepCourse();
                setUnits(units);
            } catch (error) {
                console.error('Error fetching units:', error);
            }
        };

        fetchUnits();
    }, []);

    return (
        <div>
            {units.map((unit, index) => (
                <Unit key={index} unitId={unit.id} title={unit.title} />
            ))}
        </div>
    );
}