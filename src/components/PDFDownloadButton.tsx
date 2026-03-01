import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DownloadSimple, Eye, Spinner } from '@phosphor-icons/react';

interface PDFDownloadButtonProps {
    targetId: string;
    filename: string;
}

const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({ targetId, filename }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = async () => {
        const element = document.getElementById(targetId);
        if (!element) {
            console.error(`Element with id ${targetId} not found`);
            return null;
        }

        setIsGenerating(true);

        try {
            const canvas = await html2canvas(element, {
                scale: 3,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
            heightLeft -= pdfHeight;

            // Add remaining pages if content overflows
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
                heightLeft -= pdfHeight;
            }

            return pdf;
        } catch (error) {
            console.error('Error generating PDF:', error);
            return null;
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        const pdf = await generatePDF();
        if (pdf) {
            pdf.save(`${filename}.pdf`);
        }
    };

    const handlePreview = async () => {
        const pdf = await generatePDF();
        if (pdf) {
            window.open(pdf.output('bloburl'), '_blank');
        }
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={handlePreview}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Preview PDF"
            >
                {isGenerating ? (
                    <Spinner size={20} className="animate-spin" />
                ) : (
                    <Eye size={20} weight="regular" />
                )}
                <span>Preview</span>
            </button>
            <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-900 rounded-lg text-white font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download PDF"
            >
                {isGenerating ? (
                    <Spinner size={20} className="animate-spin text-white" />
                ) : (
                    <DownloadSimple size={20} weight="fill" />
                )}
                <span>Download</span>
            </button>
        </div>
    );
};

export default PDFDownloadButton;
