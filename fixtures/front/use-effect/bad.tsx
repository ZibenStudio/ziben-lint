import { useEffect, useState } from 'react';
export const A = () => {
    const [n, setN] = useState(0);
    useEffect(() => { setN(1); }, []);
    return <p>{n}</p>;
};
