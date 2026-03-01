const parquet = require('parquetjs-lite');
const util = require('util');

(async () => {
    console.log("Exploring parquet export...");
    console.log("Keys:", Object.keys(parquet));

    if (parquet.ParquetReader) {
        console.log("ParquetReader found.");
        console.log("ParquetReader static keys:", Object.keys(parquet.ParquetReader));
        console.log("ParquetReader prototype keys:", Object.keys(parquet.ParquetReader.prototype || {}));

        try {
            console.log("Attempting ParquetReader.openFile...");
            if (typeof parquet.ParquetReader.openFile === 'function') {
                await parquet.ParquetReader.openFile('train-00000-of-00001.parquet');
                console.log("openFile success!");
            } else {
                console.log("ParquetReader.openFile is NOT a function");
            }
        } catch (e) {
            console.error("openFile error:", e);
        }
    }
})();
