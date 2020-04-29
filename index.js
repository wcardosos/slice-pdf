const SlicePDF = require('./src/SlicePDF');

arquivo = new SlicePDF(true, "./annales.pdf", "./");

arquivo.run();