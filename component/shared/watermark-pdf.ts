import fs from "fs";
import { PDFDocument, rgb, degrees } from "pdf-lib";

async function watermark() {
    const pdfBytes = fs.readFileSync("input.pdf");

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    pages.forEach((page) => {
        const { width, height } = page.getSize();

        page.drawText("YOUR BRAND NAME", {
            x: width / 2 - 120,
            y: height / 2,
            size: 40,
            color: rgb(0, 0, 0),
            // rotate: degrees(-30),
            opacity: 1,
        });
    });

    const result = await pdfDoc.save();
    fs.writeFileSync("output-preview.pdf", result);
}

watermark();
