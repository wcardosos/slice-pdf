const PDFJS = require('pdfjs-dist');
const PDFDocument = require('pdfkit');
const NodeCanvasFactory = require('./NodeCanvasFactory');
const Jimp = require('jimp');
const fs = require('fs');

class SlicePDF {
    constructor(bookCover, filePath, savePath) {
        this.bookCover = bookCover;
        this.filePath = filePath;
        this.savePath = savePath;
        this.document = undefined;
        this.documentWidth = undefined;
        this.documentHeight = undefined;
        this.viewport = undefined;
        this.numberOfPages = undefined;
        this.fileName = undefined;
    }

    setInfo = () => {
        return new Promise( resolve => {
            PDFJS.getDocument(this.filePath).promise.then( pdf => {
                pdf.getPage(1).then( page => {
                    const scale = 1.5;
                    const viewport = page.getViewport({ scale });

                    this.numberOfPages = pdf._pdfInfo.numPages;
                    this.viewport = viewport;
                    this.documentWidth = viewport.width;
                    this.documentHeight = viewport.height;
                    this.document = pdf;
                    
                    resolve();
                })
            })
            .catch( error => {
                console.log(`Error: ${error}`);
            })
        })
    }

    extractPage = async (pageNumber) => {
        const page = await this.document.getPage(pageNumber);
        const canvasFactory = new NodeCanvasFactory();
        const canvasAndContext = canvasFactory.create(this.documentWidth, this.documentHeight);
        const renderContext = {
            canvasContext: canvasAndContext.context,
            viewport: this.viewport,
            canvasFactory: canvasFactory
        };
        const task = page.render(renderContext);

        return new Promise ( resolve => {
            task.promise
                .then( () => {
                    const image = canvasAndContext.canvas.toBuffer();
                    fs.writeFileSync(`./tmp/page${pageNumber}.jpg`, image);
                    resolve();
                })
                .catch( error => {
                    console.log(error);
                })
        })
    }

    run = () => {
        this.setInfo()
            .then(() => {
                    this.extractPage(1);
                }
            )
            .catch(error => {console.log(error)});
    }
}

module.exports = SlicePDF;