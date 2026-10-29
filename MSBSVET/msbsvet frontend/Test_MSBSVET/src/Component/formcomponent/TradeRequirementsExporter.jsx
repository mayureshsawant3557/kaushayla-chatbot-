
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import agent from '../../lib/api/agent';
import { GetUserName } from '../../Endpoints_All/ITISpecification/itiSpecification';

// Correct way to initialize pdfMake fonts
if (pdfMake.vfs === undefined) {
    pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts;
}

export class TradeRequirementsExporter {
    constructor(userInfo, financialYear) {
        this.userInfo = userInfo;
        this.financialYear = financialYear;
        this.instituteName = '';
        this.instituteCode = userInfo?.UserLoginID || '';


        // Fetch institute details asynchronously
        if (this.instituteCode) {
            this.fetchInstituteName(this.instituteCode);
        }
    }
    async fetchInstituteName(userLoginId) {
        try {
            // 👇 Use Axios to call the API
            const response = await agent.get(`${GetUserName}/${userLoginId}`, {
                headers: {
                    'accept': '*/*'
                }
            });

            
            this.instituteName = response.data?.UserName || 'Unknown Institute';

        } catch (error) {
            this.instituteName = 'Error fetching name';
        }
    }

    getItemsWithNonZeroValues(items) {
        return items.filter(item =>
            (item.districtFund > 0) || (item.ppp > 0) || (item.stateFund > 0)
        );
    }

    getAllItems(items) {
        return items;
    }

    calculateTotals(items) {
        const totals = {
            districtItemsCount: 0,
            districtFundAmount: 0,
            pppItemsCount: 0,
            pppFundAmount: 0,
            stateItemsCount: 0,
            stateFundAmount: 0,
            totalItems: 0,
            totalAmount: 0
        };

        items.forEach(item => {
            const estimatedPrice = Number(item.estimatedPrice) || 0;

            totals.districtItemsCount += Number(item.districtFund) || 0;
            totals.districtFundAmount += estimatedPrice * (Number(item.districtFund) || 0);

            totals.pppItemsCount += Number(item.ppp) || 0;
            totals.pppFundAmount += estimatedPrice * (Number(item.ppp) || 0);

            totals.stateItemsCount += Number(item.stateFund) || 0;
            totals.stateFundAmount += estimatedPrice * (Number(item.stateFund) || 0);
        });

        totals.totalItems = totals.districtItemsCount + totals.pppItemsCount + totals.stateItemsCount;
        totals.totalAmount = totals.districtFundAmount + totals.pppFundAmount + totals.stateFundAmount;

        return totals;
    }

    // Excel Export - Non-zero entries
    exportToExcel(items, submissionDate) {
        try {

            const exportItems = this.getItemsWithNonZeroValues(items);

            if (exportItems.length === 0) {
                throw new Error("No items with funding to export");
            }

            const workbook = XLSX.utils.book_new();
            const wsData = [];

            // Header
            wsData.push(['Infrastructure Requirement Sheet']);
            wsData.push([`${this.instituteName} (${this.instituteCode})`]);
            wsData.push([`Financial Year: ${this.financialYear}`]);
            wsData.push([]);

            // Table Headers
            wsData.push([
                'S.N.',
                'Item Code',
                'Name of Item',
                'Sector',
                'Category',
                'Estimated Price',

                'Required as per norms',
                'Available',
                'Deficiency',

                'Items Proposed in District Fund',
                'Amount in District Fund',
                'Items Proposed in PPP',
                'Amount in PPP',
                'Items Proposed in State Fund',
                'Amount in State Fund',
                'Total Items',
                'Total Amount'
            ]);

            // Data rows
            exportItems.forEach((item, index) => {
                const estimatedPrice = Math.round(Number(item.estimatedPrice) || 0);
                const requiredAsPerNorms = Math.round(Number(item.requiredAsPerNorms) || 0);

                const available = Math.round(Number(item.available) || 0);
                const deficiency = Math.round(Number(item.deficiency) || (requiredAsPerNorms - available) );

                const districtFund = Math.round(Number(item.districtFund) || 0);
                const ppp = Math.round(Number(item.ppp) || 0);
                const stateFund = Math.round(Number(item.stateFund) || 0);

                wsData.push([
                    index + 1,
                    item.itemCode || '',
                    item.name || '',
                    item.sector || '',
                    item.category || '',
                    estimatedPrice,
                    requiredAsPerNorms,
                    available,
                    deficiency,
                    districtFund,
                    Math.round(estimatedPrice * districtFund),
                    ppp,
                    Math.round(estimatedPrice * ppp),
                    stateFund,
                    Math.round(estimatedPrice * stateFund),
                    districtFund + ppp + stateFund,
                    Math.round(estimatedPrice * (districtFund + ppp + stateFund))
                ]);
            });

            // Totals row
            const totals = this.calculateTotals(exportItems);
            wsData.push([]);
            wsData.push([
                '', 'TOTAL', '', '', '', '', '', '', '',
                Math.round(totals.districtItemsCount),
                Math.round(totals.districtFundAmount),
                Math.round(totals.pppItemsCount),
                Math.round(totals.pppFundAmount),
                Math.round(totals.stateItemsCount),
                Math.round(totals.stateFundAmount),
                Math.round(totals.totalItems),
                Math.round(totals.totalAmount)
            ]);

            // Footer
            wsData.push([]);
            wsData.push([`Date of Submission: ${submissionDate || ''}`]);
            wsData.push(['Principal Signature:']);
            wsData.push(['Principal Name:']);
            wsData.push([]);

            const now = new Date();
            const dateTimeStr = now.toLocaleString('en-IN');
            wsData.push([`Date/time: ${dateTimeStr}`, '', '', this.instituteCode]);

            const worksheet = XLSX.utils.aoa_to_sheet(wsData);

            // Set column widths
            worksheet['!cols'] = [
                { wch: 5 }, { wch: 12 }, { wch: 30 }, { wch: 15 }, { wch: 12 },
                { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 15 },
                { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 15 }
            ];

            XLSX.utils.book_append_sheet(workbook, worksheet, "Requirements");
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
            saveAs(blob, `Infrastructure_Requirements_${this.financialYear}.xlsx`);

            return true;

        } catch (error) {
            throw error;
        }
    }


    // Excel Template Export
    exportExcelTemplate(items) {
        try {
            const exportItems = this.getAllItems(items);

            const workbook = XLSX.utils.book_new();
            const wsData = [];

            wsData.push(['Infrastructure Requirement Sheet']);
            wsData.push([`${this.instituteName} (${this.instituteCode})`]);
            wsData.push([`Financial Year: ${this.financialYear}`]);
            wsData.push([]);

            wsData.push([
                'S.N.', 'Item Code', 'Name of Item', 'Sector', 'Category',
                'Estimated Price',
                'Required as per norms',
                'Available',
                'Deficiency',


                'Proposed in District Fund', 'Amount in District Fund',
                'Proposed in PPP', 'Amount in PPP', 'Proposed in State Fund',
                'Amount in State Fund', 'Total Items', 'Total Amount'
            ]);

            exportItems.forEach((item, index) => {
                const estimatedPrice = Number(item.estimatedPrice) || 0;

                const requiredAsPerNorms = Math.round(Number(item.requiredAsPerNorms) || 0);

                const available = Math.round(Number(item.available) || 0);
                const deficiency = Math.round(Number(item.deficiency) || (requiredAsPerNorms - available));

                const districtFund = Number(item.districtFund) || 0;
                const ppp = Number(item.ppp) || 0;
                const stateFund = Number(item.stateFund) || 0;

                wsData.push([
                    index + 1, item.itemCode || '', item.name || '',
                    item.sector || '', item.category || '', estimatedPrice,
                    requiredAsPerNorms, available, deficiency,


                    districtFund, estimatedPrice * districtFund,
                    ppp, estimatedPrice * ppp,
                    stateFund, estimatedPrice * stateFund,
                    districtFund + ppp + stateFund,
                    estimatedPrice * (districtFund + ppp + stateFund)
                ]);
            });

            wsData.push([]);
            const totals = this.calculateTotals(exportItems);
            wsData.push([
                '', 'TOTAL', '', '', '', '', '', '', '',
                totals.districtItemsCount,
                totals.districtFundAmount,
                totals.pppItemsCount,
                totals.pppFundAmount,
                totals.stateItemsCount,
                totals.stateFundAmount,
                totals.totalItems,
                totals.totalAmount
            ]);

            const worksheet = XLSX.utils.aoa_to_sheet(wsData);
            worksheet['!cols'] = [
                { wch: 5 }, { wch: 12 }, { wch: 30 }, { wch: 15 }, { wch: 12 },
                { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 15 },
                { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 15 }
            ];

            XLSX.utils.book_append_sheet(workbook, worksheet, "Requirements Template");
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
            saveAs(blob, `Infrastructure_Requirements_Template_${this.financialYear}.xlsx`);

            return true;
        } catch (error) {
            throw error;
        }
    }

    // PDF Export using pdfmake - BEST LIBRARY
    exportToPDF(items, submissionDate) {
        try {
            const instituteCode = this.instituteCode;

            const exportItems = this.getItemsWithNonZeroValues(items);

            if (exportItems.length === 0) {
                throw new Error("No items with funding to export");
            }

            const now = new Date();
            const dateTimeStr = now.toLocaleString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const tableBody = [];

            // Header Row
            tableBody.push([
                { text: 'S.N.', style: 'tableHeader' },
                { text: 'Item Code', style: 'tableHeader' },
                { text: 'Name of Item', style: 'tableHeader' },
                { text: 'Sector', style: 'tableHeader' },
                { text: 'Category', style: 'tableHeader' },
                { text: 'Estimated Price', style: 'tableHeader' },
                { text: 'Required as per norms', style: 'tableHeader' }, 
                { text: 'Available', style: 'tableHeader' },
                { text: 'Deficiency', style: 'tableHeader' },

                { text: 'Items Proposed in District Fund', style: 'tableHeader', fillColor: '#ffcccb' },
                { text: 'Amount in District Fund', style: 'tableHeader', fillColor: '#ffcccb' },
                { text: 'Items Proposed in PPP', style: 'tableHeader', fillColor: '#ffff00' },
                { text: 'Amount in PPP', style: 'tableHeader', fillColor: '#ffff00' },
                { text: 'Items Proposed in State Fund', style: 'tableHeader', fillColor: '#90ee90' },
                { text: 'Amount in State Fund', style: 'tableHeader', fillColor: '#90ee90' },
                { text: 'Total Items', style: 'tableHeader' },
                { text: 'Total Amount', style: 'tableHeader' }
            ]);

            // Data rows
            exportItems.forEach((item, index) => {
                const estimatedPrice = Number(item.estimatedPrice) || 0;
                const requiredAsPerNorms = Math.round(Number(item.requiredAsPerNorms) || 0);

                const available = Math.round(Number(item.available) || 0);
                //const deficiency = Math.round(Number(requiredAsPerNorms - available));
                const deficiency = Math.max(
                    0,
                    Math.round(requiredAsPerNorms - available)
                );
                const districtFund = Number(item.districtFund) || 0;
                const ppp = Number(item.ppp) || 0;
                const stateFund = Number(item.stateFund) || 0;

                tableBody.push([
                    { text: String(index + 1), style: 'tableCell' },
                    { text: item.itemCode || '', style: 'tableCell' },
                    { text: item.name || '', style: 'tableCell' },
                    { text: item.sector || '', style: 'tableCell' },
                    { text: item.category || '', style: 'tableCell' },

                    // REMOVE DECIMALS
                    { text: Math.round(estimatedPrice), style: 'tableCell', alignment: 'right' },
                    { text: Math.round(requiredAsPerNorms), style: 'tableCell', alignment: 'right' },
                    { text: Math.round(available), style: 'tableCell', alignment: 'right' },
                    { text: Math.round(deficiency), style: 'tableCell', alignment: 'right' },


                    { text: String(districtFund), style: 'tableCell', alignment: 'center', fillColor: '#ffe6e6' },
                    { text: Math.round(estimatedPrice * districtFund), style: 'tableCell', alignment: 'right', fillColor: '#ffe6e6' },

                    { text: String(ppp), style: 'tableCell', alignment: 'center', fillColor: '#ffffcc' },
                    { text: Math.round(estimatedPrice * ppp), style: 'tableCell', alignment: 'right', fillColor: '#ffffcc' },

                    { text: String(stateFund), style: 'tableCell', alignment: 'center', fillColor: '#e6ffe6' },
                    { text: Math.round(estimatedPrice * stateFund), style: 'tableCell', alignment: 'right', fillColor: '#e6ffe6' },

                    { text: String(districtFund + ppp + stateFund), style: 'tableCell', alignment: 'center' },
                    { text: Math.round(estimatedPrice * (districtFund + ppp + stateFund)), style: 'tableCell', alignment: 'right' }
                ]);
            });

            // Totals row
            const totals = this.calculateTotals(exportItems);

            tableBody.push([
                { text: '', style: 'tableCellBold' },
                { text: 'TOTAL', style: 'tableCellBold', colSpan: 5 }, {}, {}, {}, {}, {}, {}, {},
                { text: String(totals.districtItemsCount), style: 'tableCellBold', alignment: 'center' },
                { text: Math.round(totals.districtFundAmount), style: 'tableCellBold', alignment: 'right' },
                { text: String(totals.pppItemsCount), style: 'tableCellBold', alignment: 'center' },
                { text: Math.round(totals.pppFundAmount), style: 'tableCellBold', alignment: 'right' },
                { text: String(totals.stateItemsCount), style: 'tableCellBold', alignment: 'center' },
                { text: Math.round(totals.stateFundAmount), style: 'tableCellBold', alignment: 'right' },
                { text: String(totals.totalItems), style: 'tableCellBold', alignment: 'center' },
                { text: Math.round(totals.totalAmount), style: 'tableCellBold', alignment: 'right' }
            ]);

            // PDF Structure
            const docDefinition = {
                pageOrientation: 'landscape',
                pageSize: 'A4',
                pageMargins: [10, 60, 20, 60],

                header: function () {
                    return {
                        columns: [
                            {
                                text: [
                                    { text: 'Infrastructure Requirement Sheet\n', style: 'header' },
                                    { text: `${this.instituteName} (${this.instituteCode})\n`, style: 'subheader' },
                                    { text: `Financial Year: ${this.financialYear}`, style: 'subheader' }
                                ],
                                alignment: 'center',
                                margin: [0, 10, 0, 0]
                            }
                        ]
                    };
                }.bind(this),

                footer: function (currentPage, pageCount) {
                    return {
                        columns: [
                            { text: `Printed: ${dateTimeStr}`, style: 'footer', alignment: 'left', margin: [20, 0] },
                            { text: instituteCode, style: 'footer', alignment: 'left', margin: [60, 0] },
                            { text: `Page ${currentPage} of ${pageCount}`, style: 'footer', alignment: 'right', margin: [0, 0, 20, 0] }
                        ]
                    };
                },

                content: [
                    {
                        table: {
                            headerRows: 1,
                            widths: [10, 25, 60, 60, 45, 45,35,35,35, 45, 40, 40, 40, 40, 40, 30, 40],
                            body: tableBody
                        },
                        layout: {
                            fillColor: function (rowIndex) {
                                return (rowIndex === 0) ? '#cccccc' : null;
                            }
                        }
                    },
                    { text: '\n' },
                    { text: `Date of Submission: ${submissionDate}`, style: 'normal' },
                    { text: 'Principal Signature:', style: 'normal' },
                    { text: 'Principal Name:', style: 'normal' },
                    { text: '\n' }
                ],

                styles: {
                    header: { fontSize: 16, bold: true },
                    subheader: { fontSize: 12 },
                    tableHeader: { fontSize: 8, bold: true, alignment: 'center', fillColor: '#ffff00' },
                    tableCell: { fontSize: 7 },
                    tableCellBold: { fontSize: 8, bold: true },
                    footer: { fontSize: 8 },
                    normal: { fontSize: 9 }
                }
            };

            pdfMake.createPdf(docDefinition).download(`Infrastructure_Requirements_${this.financialYear}.pdf`);
            return true;

        } catch (error) {
            throw error;
        }
    }

}
