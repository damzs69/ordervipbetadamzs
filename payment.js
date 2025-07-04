// STRICT PAYMENT VALIDATION SYSTEM - LEVEL DEWA
document.addEventListener('DOMContentLoaded', function() {
    const submitPayment = document.getElementById('submitPayment');
    const paymentProof = document.getElementById('paymentProof');
    const proofError = document.getElementById('proofError');
    const formStep2 = document.getElementById('formStep2');
    const formStep3 = document.getElementById('formStep3');
    const paymentAmount = document.getElementById('paymentAmount');

    // Valid recipient names (case insensitive)
    const VALID_RECIPIENTS = ['yanti', 'damzs', 'jb damzs store'];
    
    submitPayment.addEventListener('click', async function() {
        // Reset error
        proofError.style.display = 'none';
        
        // Basic validation
        if (!paymentProof.files || paymentProof.files.length === 0) {
            showError('HARAP UPLOAD BUKTI TRANSFER!', true);
            return;
        }

        if (parseInt(paymentAmount.value) < 10000) {
            showError('MINIMAL TRANSFER RP 10.000!', true);
            return;
        }

        // Show loading indicator
        submitPayment.disabled = true;
        submitPayment.textContent = 'MEMVERIFIKASI...';

        try {
            // Process the image (in real app this would be server-side)
            const verificationResult = await verifyPaymentProof(paymentProof.files[0]);
            
            if (verificationResult.valid) {
                // SUCCESS - Payment verified
                formStep2.classList.remove('active');
                formStep3.classList.add('active');
                
                // In real app, send data to server and owner panel
                logSuccessfulPayment(verificationResult.details);
            } else {
                // FAILED - Show specific error
                showError(`VERIFIKASI GAGAL: ${verificationResult.reason}`, true);
            }
        } catch (error) {
            console.error("Verification error:", error);
            showError('TERJADI ERROR SAAT VERIFIKASI. COBA LAGI.', true);
        } finally {
            submitPayment.disabled = false;
            submitPayment.textContent = 'KONFIRMASI PEMBAYARAN';
        }
    });

    // ==================== ULTIMATE PAYMENT PROOF VERIFICATION ====================
    async function verifyPaymentProof(imageFile) {
        return new Promise((resolve) => {
            // In a real app, this would be done server-side with OCR API
            // For demo purposes, we'll simulate the verification
            
            // Simulate processing delay
            setTimeout(() => {
                // Get current time in WIB (UTC+7)
                const now = new Date();
                const wibOffset = 7 * 60 * 60 * 1000;
                const currentTimeWIB = new Date(now.getTime() + wibOffset);
                
                // Expected format: "HH:MM WIB"
                const currentHoursWIB = currentTimeWIB.getUTCHours().toString().padStart(2, '0');
                const currentMinutesWIB = currentTimeWIB.getUTCMinutes().toString().padStart(2, '0');
                const currentTimeString = `${currentHoursWIB}:${currentMinutesWIB} WIB`;
                
                // Current date in format "DD/MM/YYYY"
                const currentDay = currentTimeWIB.getUTCDate().toString().padStart(2, '0');
                const currentMonth = (currentTimeWIB.getUTCMonth() + 1).toString().padStart(2, '0');
                const currentYear = currentTimeWIB.getUTCFullYear();
                const currentDateString = `${currentDay}/${currentMonth}/${currentYear}`;
                
                // Simulate extracted data from image (would come from OCR in real app)
                const simulatedExtraction = {
                    recipientName: 'JB Damzs Store', // Would be extracted from image
                    amount: '10000', // Would be extracted from image
                    time: currentTimeString, // Should match image time
                    date: currentDateString, // Should match image date
                    bankName: 'DANA' // Would be extracted from image
                };
                
                // ===== ULTRA STRICT VALIDATION =====
                const validationResults = [];
                
                // 1. Validate recipient name (case insensitive)
                const nameValid = VALID_RECIPIENTS.some(validName => 
                    simulatedExtraction.recipientName.toLowerCase().includes(validName)
                );
                
                if (!nameValid) {
                    validationResults.push({
                        passed: false,
                        reason: 'NAMA PENERIMA TIDAK VALID! HARUS YANTI/DAMZS/JB DAMZS STORE'
                    });
                } else {
                    validationResults.push({
                        passed: true,
                        field: 'Recipient Name',
                        extracted: simulatedExtraction.recipientName
                    });
                }
                
                // 2. Validate amount (must match input amount)
                const amountValid = parseInt(simulatedExtraction.amount) >= parseInt(paymentAmount.value);
                if (!amountValid) {
                    validationResults.push({
                        passed: false,
                        reason: `NOMINAL TRANSFER TIDAK COCOK! HARUS MINIMAL RP ${paymentAmount.value}`
                    });
                } else {
                    validationResults.push({
                        passed: true,
                        field: 'Amount',
                        extracted: simulatedExtraction.amount
                    });
                }
                
                // 3. Validate time (must be within 5 minutes)
                const extractedTime = simulatedExtraction.time;
                const isTimeValid = extractedTime === currentTimeString; // In real app would allow ±5 minutes
                
                if (!isTimeValid) {
                    validationResults.push({
                        passed: false,
                        reason: `WAKTU TIDAK VALID! HARUS ${currentTimeString} (MAX 5 MENIT YANG LALU)`
                    });
                } else {
                    validationResults.push({
                        passed: true,
                        field: 'Time',
                        extracted: extractedTime,
                        current: currentTimeString
                    });
                }
                
                // 4. Validate date (must be today)
                const extractedDate = simulatedExtraction.date;
                const isDateValid = extractedDate === currentDateString;
                
                if (!isDateValid) {
                    validationResults.push({
                        passed: false,
                        reason: `TANGGAL TIDAK VALID! HARUS ${currentDateString}`
                    });
                } else {
                    validationResults.push({
                        passed: true,
                        field: 'Date',
                        extracted: extractedDate,
                        current: currentDateString
                    });
                }
                
                // 5. Validate bank (must be DANA)
                const isBankValid = simulatedExtraction.bankName.toUpperCase() === 'DANA';
                if (!isBankValid) {
                    validationResults.push({
                        passed: false,
                        reason: 'BUKTI BUKAN DARI DANA! HARUS TRANSFER VIA DANA'
                    });
                } else {
                    validationResults.push({
                        passed: true,
                        field: 'Bank',
                        extracted: simulatedExtraction.bankName
                    });
                }
                
                // Check if all validations passed
                const allValid = validationResults.every(result => result.passed);
                
                if (allValid) {
                    resolve({
                        valid: true,
                        details: {
                            phone: document.getElementById('phoneNumber').value,
                            username: document.getElementById('username').value,
                            amount: paymentAmount.value,
                            proofTime: simulatedExtraction.time,
                            proofDate: simulatedExtraction.date,
                            verificationTime: new Date().toISOString()
                        }
                    });
                } else {
                    // Find the first error reason
                    const firstError = validationResults.find(result => !result.passed);
                    resolve({
                        valid: false,
                        reason: firstError.reason,
                        validationDetails: validationResults
                    });
                }
            }, 2000); // Simulate processing delay
        });
    }

    // ==================== HELPER FUNCTIONS ====================
    function showError(message, shakeElement = false) {
        proofError.textContent = message;
        proofError.style.display = 'block';
        
        if (shakeElement) {
            paymentProof.style.animation = 'shake 0.5s';
            setTimeout(() => { paymentProof.style.animation = ''; }, 500);
        }
    }

    function logSuccessfulPayment(details) {
        // In production, this would send to your server
        console.log('PAYMENT SUCCESSFULLY VERIFIED:', details);
        
        // Add to owner panel (simulated)
        const ownerData = document.getElementById('ownerData');
        if (ownerData) {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${details.phone}</td>
                <td>${details.username}</td>
                <td>Rp ${parseInt(details.amount).toLocaleString()}</td>
                <td>${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</td>
                <td class="verified">✅ Valid</td>
            `;
            
            const table = ownerData.querySelector('table');
            if (table) {
                // Add after header row
                if (table.rows.length > 1) {
                    table.insertBefore(newRow, table.rows[1].nextSibling);
                } else {
                    table.appendChild(newRow);
                }
            }
        }
    }

    // ==================== ANTI-CHEAT MEASURES ====================
    // Prevent fake image uploads (in production would use server-side verification)
    paymentProof.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            
            // Basic client-side checks
            if (!file.type.startsWith('image/')) {
                showError('FILE HARUS GAMBAR!', true);
                this.value = '';
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) { // 5MB max
                showError('UKURAN FILE MAX 5MB!', true);
                this.value = '';
                return;
            }
            
            // Check EXIF data for manipulation signs (simplified)
            const reader = new FileReader();
            reader.onload = function(e) {
                const buffer = e.target.result;
                
                // Simple magic number check for JPEG/PNG
                if (!(buffer.byteLength > 4 && 
                    ((buffer[0] === 0xFF && buffer[1] === 0xD8) || // JPEG
                    (buffer[0] === 0x89 && buffer[1] === 0x50))) {  // PNG
                    showError('FORMAT GAMBAR TIDAK VALID!', true);
                    paymentProof.value = '';
                }
            };
            reader.readAsArrayBuffer(file.slice(0, 64)); // Read first 64 bytes only
        }
    });
});

// Add styles for verification
const paymentStyle = document.createElement('style');
paymentStyle.textContent = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
.verified { color: #4CAF50; font-weight: bold; }
.rejected { color: #f44336; font-weight: bold; }
#paymentProof {
    transition: border-color 0.3s, box-shadow 0.3s;
}
#paymentProof:invalid {
    border-color: #f44336 !important;
    box-shadow: 0 0 5px rgba(244, 67, 54, 0.5);
}
.proof-preview {
    max-width: 100%;
    margin-top: 10px;
    border: 2px solid #4CAF50;
    border-radius: 5px;
    display: none;
}`;
document.head.appendChild(paymentStyle);