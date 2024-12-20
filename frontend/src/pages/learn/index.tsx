import React, { useEffect, useState } from 'react';
import Unit from '../../components/Unit';

import { getUnitsInPrepCourse } from '../../api/api';

// Define the type for the unit data
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
                console.log('Units in prep course:', units);
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