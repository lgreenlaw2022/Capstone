import React, { useEffect, useState } from 'react';
import Unit from '../components/Unit';

// Define the type for the unit data
interface UnitData {
    id: number;
    title: string;
    completion: number;
    //   TODO: extend to the props I need
}

export default function Learn() {
    const [units, setUnits] = useState<UnitData[]>([{ id: 1, title: 'Hash Tables', completion: 0 }]);

    // Waiting for the API to be ready
    //   useEffect(() => {
    //     // Fetch units from the API
    //     fetch('/api/units')
    //       .then(response => response.json())
    //       .then(data => setUnits(data))
    //       .catch(error => console.error('Error fetching units:', error));
    //   }, []);

    return (
        <div>
            {units.map((unit, index) => (
                <Unit key={index} unitId={unit.id}title={unit.title} completion={unit.completion} />
            ))}
        </div>
    );
}