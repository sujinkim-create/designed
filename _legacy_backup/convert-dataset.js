import parquet from '@dsnp/parquetjs';
import fs from 'fs';

async function convert() {
    try {
        console.log("Parquet keys:", Object.keys(parquet));

        // Check if it's a default export
        const readerClass = parquet.ParquetReader || (parquet.default && parquet.default.ParquetReader);

        if (!readerClass) {
            console.error("ParquetReader not found! Available:", Object.keys(parquet));
            return;
        }

        console.log("Opening parquet file...");
        const reader = await readerClass.openFile('train-00000-of-00001.parquet');
        const cursor = reader.getCursor();
        const records = [];
        let record = null;

        console.log("Reading records...");
        let count = 0;
        while (record = await cursor.next()) {
            records.push(record);
            count++;
            if (count % 100 === 0) process.stdout.write('.');
        }

        await reader.close();
        console.log(`\nRead ${records.length} records.`);

        fs.writeFileSync('grammar_dataset.json', JSON.stringify(records, null, 2));
        console.log("Saved to grammar_dataset.json");

        // Also save a small sample for quick viewing
        fs.writeFileSync('grammar_dataset_sample.json', JSON.stringify(records.slice(0, 5), null, 2));
        console.log("Saved sample to grammar_dataset_sample.json");

    } catch (e) {
        console.error("Error converting file:", e);
    }
}

convert();
