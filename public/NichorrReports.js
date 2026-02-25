// NichorrReports.js - Branded Export Engine for Nichorr AI
const NichorrExport = {
    // 📊 ULTRA-PREMIUM EXCEL
    excel: (data) => {
        if (!data || data.length === 0) return alert("Lala, data to hone do!");

        // Metadata and Header
        const wsData = [
            ["NICHORR AI | PREMIUM ASSET INVENTORY"],
            ["Report Generated:", new Date().toLocaleString()],
            ["Total Inventory Count:", data.length + " Websites"],
            ["Total Market Value:", "$" + data.reduce((acc, curr) => acc + (curr.authorityScore * 3.5), 0).toLocaleString()],
            [], // Spacer
            ["WEBSITE URL", "AUTHORITY (DA)", "RISK STATUS", "MARKET VALUE ($)"]
        ];

        // Inject Data
        data.forEach(item => {
            wsData.push([
                item.websiteUrl,
                item.authorityScore,
                item.spamScore < 5 ? "✅ SAFE" : "⚠️ AUDIT REQUIRED",
                "$" + (item.authorityScore * 3.5).toLocaleString()
            ]);
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Column Width Adjustment for Professional Look
        ws['!cols'] = [{ wch: 50 }, { wch: 20 }, { wch: 25 }, { wch: 20 }];

        XLSX.utils.book_append_sheet(wb, ws, "Nichorr Inventory");
        XLSX.writeFile(wb, `Nichorr_Inventory_${Date.now()}.xlsx`);
    },

    // 📄 BRANDED PDF DESIGN (AutoTable Powered)
    pdf: (data) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // --- 01. Professional Dark Header ---
        doc.setFillColor(15, 23, 42); 
        doc.rect(0, 0, 210, 45, 'F');

        // Brand Logo Text
        doc.setTextColor(56, 189, 248); 
        doc.setFontSize(28);
        doc.setFont("helvetica", "bold");
        doc.text("NICHORR AI", 15, 25);

        // Sub-header Info
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("PREMIUM SEO ASSET MANAGEMENT SYSTEM", 15, 33);
        
        // Date & Page Info on Header Right
        doc.setFontSize(8);
        doc.text(`GENERATED: ${new Date().toLocaleString()}`, 145, 25);
        doc.text("STATUS: OFFICIAL REPORT", 145, 30);

        // --- 02. Summary Highlight Card ---
        const totalVal = data.reduce((acc, curr) => acc + (curr.authorityScore * 3.5), 0);
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(15, 52, 180, 18, 3, 3, 'F');
        
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`INVENTORY SUMMARY:`, 22, 59);
        doc.setFont("helvetica", "normal");
        doc.text(`Total Assets: ${data.length} | Net Market Value: $${totalVal.toLocaleString()}`, 22, 65);

        // --- 03. Data Table ---
        const tableRows = data.map(d => [
            d.websiteUrl,
            d.authorityScore + "/100",
            d.spamScore < 5 ? "VERIFIED SAFE" : "RISK DETECTED",
            "$" + (d.authorityScore * 3.5).toLocaleString()
        ]);

        doc.autoTable({
            startY: 78,
            head: [['WEBSITE URL', 'AUTHORITY', 'RISK STATUS', 'VALUE (USD)']],
            body: tableRows,
            theme: 'grid',
            headStyles: { 
                fillColor: [15, 23, 42], 
                textColor: [56, 189, 248], 
                fontSize: 10, 
                fontStyle: 'bold',
                halign: 'center'
            },
            columnStyles: {
                0: { cellWidth: 85, fontStyle: 'bold' },
                1: { halign: 'center' },
                2: { halign: 'center' },
                3: { halign: 'right', fontStyle: 'bold', textColor: [22, 163, 74] }
            },
            styles: { fontSize: 8, cellPadding: 4, lineColor: [226, 232, 240] },
            alternateRowStyles: { fillColor: [248, 250, 252] }
        });

        // --- 04. Footer ---
        const pageCount = doc.internal.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text("© 2026 NICHORR AI - PROPRIETARY DATA", 15, 287);
            doc.text(`Page ${i} of ${pageCount}`, 180, 287);
        }

        doc.save(`Nichorr_Premium_Report_${Date.now()}.pdf`);
    }
};