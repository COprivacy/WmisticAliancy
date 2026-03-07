async function test() {
    const ids = ["203443132", "20344313", "2034431322", "12345678"]; // Also test a known bad one
    const zones = ["1808", "808", "3220"];

    for (const id of ids) {
        for (const zone of zones) {
            const url = `https://api.isan.eu.org/nickname/ml?id=${id}&zone=${zone}`;
            try {
                const res = await fetch(url);
                if (res.ok) {
                    const json = await res.json();
                    if (json.success) {
                        console.log(`FOUND! ID: ${id}, Zone: ${zone} -> `, json);
                    }
                }
            } catch (e) { }
        }
    }
}
test();
