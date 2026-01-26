
import { useState, useEffect } from "react";

export default function useFetch(url, options = {}, trigger = null) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!url) return;

        const fetch = async () => {
            setLoading(true);
            setError(null);
            fetch(url, options)
                .then(res => res.json())
                .then(setData)
                .catch(setError)
                .finally(() => setLoading(false));
        };
        
        fetch();
        // eslint-disable-next-line
    }, [url, trigger]);

    return { data, loading, error };
}
