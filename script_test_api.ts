async function test() {
    const url = 'https://api.isan.eu.org/nickname/ml?id=20344313220&zone=1808';
    console.log("Fetching URL:", url);
    try {
        const res = await fetch(url);
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response:", text);
    } catch (err) {
        console.error(err);
    }
}
test();
