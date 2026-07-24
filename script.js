 // DOM এলিমেন্ট সিলেক্ট
        const yearInput = document.getElementById('year');
        const monthSelect = document.getElementById('month');
        const monthStatus = document.getElementById('monthStatus');
        const admissionIncomeInput = document.getElementById('admissionIncome');
        const salaryIncomeInput = document.getElementById('salaryIncome');
        const madrasaExpenseInput = document.getElementById('madrasaExpense');
        const teacherSalaryInput = document.getElementById('teacherSalary');
        const saveBtn = document.getElementById('saveBtn');
        const updateBtn = document.getElementById('updateBtn');
        const resetBtn = document.getElementById('resetBtn');
        const previewPdfBtn = document.getElementById('previewPdfBtn');
        const quickPdfBtn = document.getElementById('quickPdfBtn');
        const addYearBtn = document.getElementById('addYearBtn');
        const yearSelector = document.getElementById('yearSelector');
        const selectedYearTitle = document.getElementById('selectedYearTitle');
        const currentYearDisplay = document.getElementById('currentYearDisplay');
        const statsPanel = document.getElementById('statsPanel');
        const monthlyCardsContainer = document.getElementById('monthlyCardsContainer');
        const totalIncome = document.getElementById('totalIncome');
        const totalExpense = document.getElementById('totalExpense');
        const totalNet = document.getElementById('totalNet');
        const toast = document.getElementById('toast');
        const toastTitle = document.getElementById('toastTitle');
        const toastMessage = document.getElementById('toastMessage');
        const loader = document.getElementById('loader');
        const loaderMessage = document.getElementById('loaderMessage');
        const pdfPreviewModal = document.getElementById('pdfPreviewModal');
        const pdfPreviewContent = document.getElementById('pdfPreviewContent');
        const closePreviewModal = document.getElementById('closePreviewModal');
        const closePreviewBtn = document.getElementById('closePreviewBtn');
        const downloadPdfBtn = document.getElementById('downloadPdfBtn');

        // ভেরিয়েবল
        let financialData = {};
        let editingIndex = -1;
        let selectedYear = new Date().getFullYear();
        let editingYear = null;

        // মাসের তালিকা
        const monthList = [
            'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
            'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
        ];

        // লোকাল স্টোরেজ থেকে ডেটা লোড করার সংশোধিত ফাংশন
        function loadData() {
            const savedData = localStorage.getItem('alhamraMadrasaData');
            if (savedData) {
                try {
                    financialData = JSON.parse(savedData);
                } catch(e) {
                    financialData = {};
                }
            } else {
                financialData = {}; // ভুল ডেমো ডাটা তুলে দেওয়া হয়েছে যেন ফায়ারবেস ওভাররাইট না হয়
            }
            populateYearSelector();
            loadYearData(selectedYear);
            updateMonthDropdown();
        }

        // লোকাল স্টোরেজে ডেটা সেভ
        function saveData() {
            localStorage.setItem('alhamraMadrasaData', JSON.stringify(financialData));
        }

        // টোস্ট শো
        function showToast(title, message, type = 'success') {
            toastTitle.textContent = title;
            toastMessage.textContent = message;
            toast.className = `toast ${type}`;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        // বছর সিলেক্টর পপুলেট
        function populateYearSelector() {
            const years = Object.keys(financialData).sort((a, b) => b - a);
            yearSelector.innerHTML = '';
            
            if (years.length === 0) {
                const currentYr = new Date().getFullYear();
                const option = document.createElement('option');
                option.value = currentYr;
                option.textContent = `${currentYr} সাল`;
                yearSelector.appendChild(option);
            } else {
                years.forEach(year => {
                    const option = document.createElement('option');
                    option.value = year;
                    option.textContent = `${year} সাল`;
                    if (parseInt(year) === selectedYear) {
                        option.selected = true;
                    }
                    yearSelector.appendChild(option);
                });
            }

            const currentYear = new Date().getFullYear();
            const nextYear = currentYear + 1;
            if (!years.includes(nextYear.toString())) {
                const option = document.createElement('option');
                option.value = nextYear;
                option.textContent = `নতুন সাল যোগ করুন (${nextYear})`;
                yearSelector.appendChild(option);
            }
            currentYearDisplay.textContent = `${selectedYear} সাল`;
        }

        // মাস ড্রপডাউন আপডেট
        function updateMonthDropdown() {
            const year = parseInt(yearInput.value);
            const yearData = financialData[year] || [];
            const existingMonths = yearData.map(data => data.month);

            monthSelect.innerHTML = '<option value="">মাস নির্বাচন করুন</option>';

            monthList.forEach(month => {
                if (editingYear === year && editingIndex !== -1) {
                    const editingMonth = yearData[editingIndex]?.month;
                    if (month === editingMonth) {
                        const option = document.createElement('option');
                        option.value = month;
                        option.textContent = month;
                        option.selected = true;
                        monthSelect.appendChild(option);
                        return;
                    }
                }

                if (!existingMonths.includes(month)) {
                    const option = document.createElement('option');
                    option.value = month;
                    option.textContent = month;
                    monthSelect.appendChild(option);
                }
            });

            const availableMonths = monthList.filter(month => !existingMonths.includes(month));
            if (availableMonths.length === 0) {
                monthStatus.textContent = 'এই বছরের সব মাসের তথ্য দেওয়া হয়েছে';
                monthStatus.classList.add('show');
            } else {
                monthStatus.textContent = `এখনও ${availableMonths.length}টি মাসের তথ্য দেওয়া বাকি`;
                monthStatus.classList.add('show');
            }
        }

        // নির্বাচিত বছরের ডেটা লোড
        function loadYearData(year) {
            selectedYear = parseInt(year);
            selectedYearTitle.textContent = `${year} সালের আয়-ব্যয় খাতা`;
            currentYearDisplay.textContent = `${year} সাল`;
            yearInput.value = year;

            const yearData = financialData[year] || [];

            if (yearData.length === 0) {
                monthlyCardsContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list empty-icon"></i>
                        <h3>এই বছরের কোনো তথ্য পাওয়া যায়নি</h3>
                        <p>নতুন মাসের তথ্য যোগ করুন</p>
                    </div>
                `;
                statsPanel.style.display = 'none';
                return;
            }

            statsPanel.style.display = 'grid';

            const sortedData = [...yearData].sort((a, b) => {
                return monthList.indexOf(a.month) - monthList.indexOf(b.month);
            });

            let cardsHTML = '';
            let totalYearIncome = 0;
            let totalYearExpense = 0;

            sortedData.forEach((data, index) => {
                const totalMonthIncome = data.admissionIncome + data.salaryIncome;
                const totalMonthExpense = data.madrasaExpense + data.teacherSalary;
                const netAmount = totalMonthIncome - totalMonthExpense;

                totalYearIncome += totalMonthIncome;
                totalYearExpense += totalMonthExpense;

                const statusClass = netAmount >= 0 ? 'status-positive' : 'status-negative';
                const statusText = netAmount >= 0 ? 'আয়' : 'ব্যয়';
                const netValue = Math.abs(netAmount);

                cardsHTML += `
                    <div class="month-card">
                        <div class="month-card-header">
                            <div class="month-name">
                                <i class="far fa-calendar"></i> ${data.month}
                            </div>
                            <div class="month-status-badge ${statusClass}">
                                ${formatCurrency(netValue)} টাকা (${statusText})
                            </div>
                        </div>
                        <div class="month-summary">
                            <div class="summary-item">
                                <div class="summary-label">মোট আয়</div>
                                <div class="summary-value income-value-card">${formatCurrency(totalMonthIncome)} টাকা</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-label">মোট ব্যয়</div>
                                <div class="summary-value expense-value-card">${formatCurrency(totalMonthExpense)} টাকা</div>
                            </div>
                        </div>
                        <div class="month-card-footer">
                            <div class="card-actions">
                                <button class="card-action-btn edit-btn" onclick="editData(${year}, ${index})" title="সম্পাদনা">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="card-action-btn delete-btn" onclick="deleteData(${year}, ${index})" title="মুছুন">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });

            monthlyCardsContainer.innerHTML = cardsHTML;

            const netAmount = totalYearIncome - totalYearExpense;
            totalIncome.textContent = `${formatCurrency(totalYearIncome)} টাকা`;
            totalExpense.textContent = `${formatCurrency(totalYearExpense)} টাকা`;
            totalNet.textContent = `${formatCurrency(Math.abs(netAmount))} টাকা`;
            totalNet.style.color = netAmount >= 0 ? 'var(--success)' : 'var(--danger)';

            updateMonthDropdown();
        }

        // কারেন্সি ফরম্যাট
        function formatCurrency(amount) {
            return new Intl.NumberFormat('bn-BD').format(amount);
        }

        // ডেটা ভ্যালিডেশন
        function validateForm() {
            const year = parseInt(yearInput.value);
            const month = monthSelect.value;

            if (!year || year < 2000 || year > 2100) {
                showToast('ভুল সাল', 'দয়া করে সঠিক সাল লিখুন (২০০০-২১০০)', 'error');
                return false;
            }

            if (!month) {
                showToast('মাস নির্বাচন করুন', 'দয়া করে মাস নির্বাচন করুন', 'error');
                return false;
            }

            return true;
        }

        // নতুন ডেটা সংরক্ষণ
        function saveNewData() {
            if (!validateForm()) return;

            const year = parseInt(yearInput.value);
            const month = monthSelect.value;
            const admissionIncome = parseFloat(admissionIncomeInput.value) || 0;
            const salaryIncome = parseFloat(salaryIncomeInput.value) || 0;
            const madrasaExpense = parseFloat(madrasaExpenseInput.value) || 0;
            const teacherSalary = parseFloat(teacherSalaryInput.value) || 0;

            const entry = { month, admissionIncome, salaryIncome, madrasaExpense, teacherSalary };

            if (!financialData[year]) {
                financialData[year] = [];
            }

            financialData[year].push(entry);
            saveData();

            if (year === selectedYear) {
                loadYearData(year);
            } else {
                populateYearSelector();
            }

            resetForm();
            showToast('সংরক্ষণ সফল', `${month} মাসের তথ্য সংরক্ষণ করা হয়েছে`);
        }

        // ডেটা সম্পাদনা
        function editData(year, index) {
            const yearData = financialData[year];
            const data = yearData[index];

            yearInput.value = year;
            monthSelect.value = data.month;
            admissionIncomeInput.value = data.admissionIncome;
            salaryIncomeInput.value = data.salaryIncome;
            madrasaExpenseInput.value = data.madrasaExpense;
            teacherSalaryInput.value = data.teacherSalary;

            editingYear = year;
            editingIndex = index;

            saveBtn.style.display = 'none';
            updateBtn.style.display = 'flex';

            updateMonthDropdown();
        }

        // ডেটা আপডেট
        function updateData() {
            if (!validateForm()) return;

            const year = editingYear;
            const index = editingIndex;
            const month = monthSelect.value;
            const admissionIncome = parseFloat(admissionIncomeInput.value) || 0;
            const salaryIncome = parseFloat(salaryIncomeInput.value) || 0;
            const madrasaExpense = parseFloat(madrasaExpenseInput.value) || 0;
            const teacherSalary = parseFloat(teacherSalaryInput.value) || 0;

            const entry = { month, admissionIncome, salaryIncome, madrasaExpense, teacherSalary };

            financialData[year][index] = entry;
            saveData();

            loadYearData(selectedYear);
            resetForm();
            showToast('আপডেট সফল', 'তথ্য আপডেট করা হয়েছে');
        }

        // ডেটা মুছুন
        function deleteData(year, index) {
            if (confirm(`আপনি কি ${year} সালের এই মাসের তথ্য মুছতে চান?`)) {
                financialData[year].splice(index, 1);
                if (financialData[year].length === 0) {
                    delete financialData[year];
                }
                saveData();
                loadYearData(selectedYear);
                showToast('ডিলিট সফল', 'তথ্য মুছে ফেলা হয়েছে');
            }
        }

        // ফরম রিসেট
        function resetForm() {
            yearInput.value = selectedYear;
            monthSelect.value = '';
            admissionIncomeInput.value = '0';
            salaryIncomeInput.value = '0';
            madrasaExpenseInput.value = '0';
            teacherSalaryInput.value = '0';

            editingYear = null;
            editingIndex = -1;

            saveBtn.style.display = 'flex';
            updateBtn.style.display = 'none';

            updateMonthDropdown();
        }

        // নতুন সাল যোগ
        function addNewYear() {
            const currentYear = new Date().getFullYear();
            const nextYear = currentYear + 1;

            if (!financialData[nextYear]) {
                financialData[nextYear] = [];
                saveData();
                populateYearSelector();
                yearSelector.value = nextYear;
                selectedYear = nextYear;
                loadYearData(nextYear);
                showToast('নতুন সাল যোগ করা হয়েছে', `${nextYear} সাল যোগ করা হয়েছে`);
            } else {
                showToast('তথ্য বিদ্যমান', `${nextYear} সাল ইতিমধ্যে আছে`, 'error');
            }
        }

        // প্রিভিউ HTML তৈরি
        function generatePreviewHTML(year) {
            const yearData = financialData[year] || [];
            if (yearData.length === 0) {
                return '<div style="text-align: center; padding: 40px; color: #95a5a6;">কোন তথ্য নেই</div>';
            }

            const allMonthsData = [];
            let totalAdmissionIncome = 0;
            let totalSalaryIncome = 0;
            let totalMadrasaExpense = 0;
            let totalTeacherSalary = 0;
            let totalIncome = 0;
            let totalExpense = 0;

            monthList.forEach(month => {
                const existingData = yearData.find(data => data.month === month);
                if (existingData) {
                    allMonthsData.push({
                        month,
                        admissionIncome: existingData.admissionIncome,
                        salaryIncome: existingData.salaryIncome,
                        madrasaExpense: existingData.madrasaExpense,
                        teacherSalary: existingData.teacherSalary
                    });
                    totalAdmissionIncome += existingData.admissionIncome;
                    totalSalaryIncome += existingData.salaryIncome;
                    totalMadrasaExpense += existingData.madrasaExpense;
                    totalTeacherSalary += existingData.teacherSalary;
                    totalIncome += (existingData.admissionIncome + existingData.salaryIncome);
                    totalExpense += (existingData.madrasaExpense + existingData.teacherSalary);
                } else {
                    allMonthsData.push({
                        month, admissionIncome: 0, salaryIncome: 0, madrasaExpense: 0, teacherSalary: 0
                    });
                }
            });

            const netAmount = totalIncome - totalExpense;

            const previewHTML = `
                <div class="preview-content">
                    <div class="preview-header">
                        <h1 class="preview-title">আল হামরা নূরানী মাদরাসা</h1>
                        <h2 class="preview-subtitle">আয় ব্যয় হিসাব - ${year} সাল</h2>
                        <p class="preview-date">প্রস্তুতির তারিখ: ${new Date().toLocaleDateString('bn-BD')}</p>
                    </div>

                    <table class="pdf-preview-table">
                        <thead>
                            <tr>
                                <th>মাস</th>
                                <th>ভর্তি বাবদ আয়</th>
                                <th>বেতন বাবদ আয়</th>
                                <th>মাদরাসার মাসিক খরচ</th>
                                <th>শিক্ষক বেতন</th>
                                <th>মোট আয়</th>
                                <th>মোট ব্যয়</th>
                                <th>নিট অবস্থা</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${allMonthsData.map(data => {
                                const monthIncome = data.admissionIncome + data.salaryIncome;
                                const monthExpense = data.madrasaExpense + data.teacherSalary;
                                const net = monthIncome - monthExpense;
                                const monthNetColor = net >= 0 ? 'var(--success)' : 'var(--danger)';
                                const monthNetText = net >= 0 ? 'আয়' : 'ঘাটতি';
                                return `
                                    <tr>
                                        <td class="month-cell">${data.month}</td>
                                        <td class="income-cell">${formatCurrency(data.admissionIncome)}</td>
                                        <td class="income-cell">${formatCurrency(data.salaryIncome)}</td>
                                        <td class="expense-cell">${formatCurrency(data.madrasaExpense)}</td>
                                        <td class="expense-cell">${formatCurrency(data.teacherSalary)}</td>
                                        <td class="income-cell">${formatCurrency(monthIncome)}</td>
                                        <td class="expense-cell">${formatCurrency(monthExpense)}</td>
                                        <td style="color: ${monthNetColor}; font-weight: 600;">
                                            ${formatCurrency(Math.abs(net))} টাকা (${monthNetText})
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>

                    <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <h4 style="color: var(--primary); margin-bottom: 10px;">১২ মাসের মোট আয়/ঘাটতির হিসাব:</h4>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                            <div style="text-align: center; padding: 10px; background: white; border-radius: 6px; border-left: 4px solid var(--success);">
                                <div style="font-size: 12px; color: var(--gray);">সর্বমোট আয়</div>
                                <div style="font-size: 18px; color: var(--success); font-weight: 700;">${formatCurrency(totalIncome)} টাকা</div>
                            </div>
                            <div style="text-align: center; padding: 10px; background: white; border-radius: 6px; border-left: 4px solid var(--danger);">
                                <div style="font-size: 12px; color: var(--gray);">সর্বমোট ব্যয়</div>
                                <div style="font-size: 18px; color: var(--danger); font-weight: 700;">${formatCurrency(totalExpense)} টাকা</div>
                            </div>
                            <div style="text-align: center; padding: 10px; background: white; border-radius: 6px; border-left: 4px solid ${netAmount >= 0 ? 'var(--success)' : 'var(--danger)'};">
                                <div style="font-size: 12px; color: var(--gray);">নিট ${netAmount >= 0 ? 'আয়' : ' ঘাটতি'}</div>
                                <div style="font-size: 18px; color: ${netAmount >= 0 ? 'var(--success)' : 'var(--danger)'}; font-weight: 700;">
                                    ${formatCurrency(Math.abs(netAmount))} টাকা
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="footer-note">
                        আল হামরা নূরানী মাদরাসা - আয় ব্যয় ব্যবস্থাপনা সিস্টেম <br>
                        <div style="font-size: 18px; color: ${netAmount >= 0 ? 'var(--success)' : 'var(--danger)'}; font-weight: 700;">
                            প্রস্তুতকারক:- মোবারাক হোসেন <br>
                            আল হামরা নূরানী মাদরাসা, ধানুয়াখালী <br>
                        </div>
                    </div>

                    <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <h5 style="color: var(--primary); margin-bottom: 15px;">বি:দ্র:</h5>
                        <div style="display: grid; grid-template-columns: repeat(1, 1fr); gap: 15px;">
                            <div style="text-align: center; padding: 10px; background: white; border-radius: 6px; border-left: 4px solid var(--success);">
                                <div style="font-size: 20px; color: var(--red);">প্রতি মাসে চা/পানের জন্য ২৬০ টাকা বরাদ্দ</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            return previewHTML;
        }

        // পিডিএফ প্রিভিউ তৈরি
        function showPdfPreview() {
            const year = selectedYear;
            const yearData = financialData[year] || [];

            if (yearData.length === 0) {
                showToast('কোন তথ্য নেই', 'পিডিএফ প্রিভিউ দেখাতে তথ্য যোগ করুন', 'error');
                return;
            }

            const previewHTML = generatePreviewHTML(year);
            pdfPreviewContent.innerHTML = previewHTML;
            pdfPreviewModal.classList.add('active');
        }

        // পিডিএফ তৈরি এবং ডাউনলোড
        function generatePDF(download = true) {
            const year = selectedYear;
            const yearData = financialData[year] || [];

            if (yearData.length === 0) {
                showToast('কোন তথ্য নেই', 'পিডিএফ তৈরি করতে তথ্য যোগ করুন', 'error');
                return;
            }

            loaderMessage.textContent = "পিডিএফ তৈরি করা হচ্ছে...";
            loader.classList.add('active');

            const previewHTML = generatePreviewHTML(year);

            const tempElement = document.createElement('div');
            tempElement.style.position = 'absolute';
            tempElement.style.left = '-9999px';
            tempElement.style.top = '0';
            tempElement.style.width = '800px';
            tempElement.style.padding = '20px';
            tempElement.style.backgroundColor = 'white';
            tempElement.style.fontFamily = "'Noto Sans Bengali', sans-serif";
            tempElement.innerHTML = previewHTML;

            document.body.appendChild(tempElement);

            html2canvas(tempElement, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                allowTaint: true
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/jpeg', 0.9);
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');

                const pageWidth = pdf.internal.pageSize.getWidth();
                const imgWidth = pageWidth - 20;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);

                document.body.removeChild(tempElement);

                if (download) {
                    pdf.save(`al-hamra-madrasa-${year}-আয়-ব্যয়.pdf`);
                    loader.classList.remove('active');
                    showToast('পিডিএফ তৈরি সম্পন্ন', 'পিডিএফ ডাউনলোড শুরু হয়েছে');
                }
                return pdf;
            }).catch(error => {
                console.error('পিডিএফ তৈরি করতে সমস্যা:', error);
                document.body.removeChild(tempElement);
                loader.classList.remove('active');
                showToast('ত্রুটি', 'পিডিএফ তৈরি করতে সমস্যা হয়েছে', 'error');
            });
        }

        // দ্রুত পিডিএফ তৈরি
        function quickGeneratePDF() {
            generatePDF(true);
        }

        // পিডিএফ প্রিভিউ থেকে ডাউনলোড
        function downloadPdfFromPreview() {
            generatePDF(true);
            pdfPreviewModal.classList.remove('active');
        }

        // ইভেন্ট লিসেনার
        document.addEventListener('DOMContentLoaded', function() {
            const currentYear = new Date().getFullYear();
            selectedYear = currentYear;

            // বাটন ইভেন্ট
            saveBtn.addEventListener('click', saveNewData);
            updateBtn.addEventListener('click', updateData);
            resetBtn.addEventListener('click', resetForm);
            previewPdfBtn.addEventListener('click', showPdfPreview);
            quickPdfBtn.addEventListener('click', quickGeneratePDF);
            addYearBtn.addEventListener('click', addNewYear);

            // বছর পরিবর্তন ইভেন্ট
            yearSelector.addEventListener('change', function() {
                selectedYear = parseInt(this.value);
                loadYearData(selectedYear);
            });

            // সাল ইনপুট পরিবর্তন ইভেন্ট
            yearInput.addEventListener('change', updateMonthDropdown);

            // পিডিএফ প্রিভিউ মোডাল ইভেন্ট
            closePreviewModal.addEventListener('click', () => {
                pdfPreviewModal.classList.remove('active');
            });

            closePreviewBtn.addEventListener('click', () => {
                pdfPreviewModal.classList.remove('active');
            });

            downloadPdfBtn.addEventListener('click', downloadPdfFromPreview);

            pdfPreviewModal.addEventListener('click', (e) => {
                if (e.target === pdfPreviewModal) {
                    pdfPreviewModal.classList.remove('active');
                }
            });
        });

        // গ্লোবাল ফাংশন তৈরি
        window.editData = editData;
        window.deleteData = deleteData;
    
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
        import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

        const firebaseConfig = {
            apiKey: "AIzaSyD3GTN_6ieNI2Q8q_L0TyiD6C2i-qrGztA",
            authDomain: "madrasa-hisab-96f66.firebaseapp.com",
            databaseURL: "https://madrasa-hisab-96f66-default-rtdb.firebaseio.com",
            projectId: "madrasa-hisab-96f66",
            storageBucket: "madrasa-hisab-96f66.firebasestorage.app",
            messagingSenderId: "687235986529",
            appId: "1:687235986529:web:c24ba4c23f867d9e406620"
        };

        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);
        const dbRef = ref(db, 'madrasa_store');

        let isUpdatingFromFirebase = false;

        // ১. ফায়ারবেস থেকে অন-ভ্যালু দিয়ে ডাটা আসবে এবং আগে লোকাল স্টোরেজে সেট হবে
        onValue(dbRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                isUpdatingFromFirebase = true;
                Object.keys(data).forEach(key => {
                    localStorage.setItem(key, data[key]);
                });
                isUpdatingFromFirebase = false;
                
                // স্ক্রিনের ভিউ রিফ্রেশ করা
                if (typeof loadData === 'function') {
                    loadData();
                }
            } else {
                // ফায়ারবেসে ডাটা না থাকলে স্ক্রিন রেন্ডার করা
                if (typeof loadData === 'function') {
                    loadData();
                }
            }
        });

        // ২. তুমি ইনপুট দিলে ব্যাকগ্রাউন্ডে নিরাপদে ফায়ারবেসে আপডেট চলে যাবে
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            originalSetItem.apply(this, arguments);
            if (!isUpdatingFromFirebase) {
                set(ref(db, 'madrasa_store/' + key), value);
            }
        };

        const originalRemoveItem = localStorage.removeItem;
        localStorage.removeItem = function(key) {
            originalRemoveItem.apply(this, arguments);
            if (!isUpdatingFromFirebase) {
                set(ref(db, 'madrasa_store/' + key), null);
            }
        };

        const originalClear = localStorage.clear;
        localStorage.clear = function() {
            originalClear.apply(this, arguments);
            if (!isUpdatingFromFirebase) {
                set(ref(db, 'madrasa_store'), null);
            }
        };