const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    FieldValue, // Import FieldValue for serverTimestamp
} = require("firebase-admin/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

const adminApp = initializeApp();
const db = getFirestore(adminApp);

exports.sendWorkerInvitation = onDocumentCreated(
    "businesses/{businessId}/workers/{workerId}", // Path to watch
    async (event) => {
        const snapshot = event.data;
        if (!snapshot) {
            console.log("No data associated with the event");
            return;
        }

        const workerData = snapshot.data();

        // Basic validation (ensure required fields exist)
        if (
            !workerData.worker_email ||
            !workerData.worker_name ||
            !workerData.worker_id ||
            !workerData.inviteLink || // Ensure inviteLink is present
            !workerData.businessId ||
            !workerData.businessname
        ) {
            console.error("Missing required worker data:", workerData);
            return;
        }

        if (workerData.worker_wallet) {
            console.error("Mailed already sent to:", workerData);
            return;
        }

        const db = getFirestore(adminApp);

        // Construct email data (similar to your frontend, but retrieved from Firestore)
        const emailData = {
            to: workerData.worker_email,
            message: {
                subject: `Invitation to Join ${workerData.businessname} Payroll System`,
                text: `Hello ${workerData.worker_name},\n\nYou have been invited to join the payroll system.\n\nPlease click the following link to connect your wallet and complete your registration:\n\n${workerData.inviteLink}\n\nBest regards,\nTeam`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to ${workerData.businessname}</h2>
            <p>Hello ${workerData.worker_name},</p>
            <p>You have been invited to join our payroll system. To complete your registration, please connect your wallet using the link below:</p>
            <p>${workerData.inviteLink}</p>
            <p>Best regards,<br>${workerData.businessname} Team</p>
          </div>
        `,
            },

            attachments: [],
        };

        // Add email to the 'mail' collection. The Trigger Email extension will handle the rest.
        try {
            const worker_id = workerData.worker_id;
            await db.collection("mail").doc(`${worker_id}_invitation`).set(emailData);
            console.log(`Email queued for worker: ${workerData.worker_email}`);
        } catch (error) {
            console.error("Error adding email to queue:", error);
        }
    }
);

exports.updateWorkerProfile = onDocumentCreated(
    "Workers/{company_id}/workers/{worker_id}",
    async (event) => {
        try {
            const { company_id, worker_id } = event.params;
            const workerData = event.data.data();
            const account = { address: workerData.worker_wallet };

            // Input Validation - Production Ready Code MUST Validate Inputs
            if (!company_id) {
                throw new Error("Company ID is missing in event parameters.");
            }
            if (!worker_id) {
                throw new Error("Worker ID is missing in event parameters.");
            }
            if (!workerData) {
                throw new Error("Worker data is missing from event data.");
            }
            if (!account.address) {
                throw new Error("Worker wallet address is missing in worker data.");
            }

            // Validate if company exists and get its wallet address
            const companySnap = await db.collection("users").doc(company_id).get();

            if (!companySnap.exists) {
                throw new Error(`Company with ID: ${company_id} does not exist`); // More descriptive error
            }

            const companyData = companySnap.data();
            const companyWalletAddress = companyData.wallet_address;

            if (!companyWalletAddress) {
                throw new Error(
                    `Company wallet address not found for company ID: ${company_id}`
                ); // More descriptive error
            }

            // Update worker document with new data in "Workers" collection
            await db
                .collection("Workers")
                .doc(company_id)
                .collection("workers")
                .doc(worker_id)
                .set(
                    {
                        worker_wallet: account.address,
                        status: "active",
                        company_id: company_id,
                        company_wallet: companyWalletAddress,
                        updatedAt: FieldValue.serverTimestamp(), // Use FieldValue.serverTimestamp
                    },
                    { merge: true }
                );

            const worker_wallet = account.address; // Consider if toUpperCase() is always needed

            await db
                .collection("businesses")
                .doc(companyWalletAddress)
                .collection("workers")
                .doc(worker_id)
                .set(
                    {
                        worker_wallet: worker_wallet,
                        status: "active",
                        updatedAt: FieldValue.serverTimestamp(),
                    },
                    { merge: true }
                );

            return {
                success: true,
                message: "Worker profile updated successfully",
                workerId: worker_id,
                companyId: company_id,
            };
        } catch (error) {
            console.error("PRODUCTION ERROR - updateWorkerProfile failed:", error);

            throw new Error(
                `PRODUCTION ERROR - Failed to update worker profile: ${error.message}`
            );
        }
    }
);

exports.sendContractorInvitation = onDocumentCreated(
    "businesses/{businessId}/contractors/{contractorId}", // Path to watch
    async (event) => {
        const snapshot = event.data;
        if (!snapshot) {
            console.log("No data associated with the event");
            return;
        }

        const contractorData = snapshot.data();

        // Basic validation (ensure required fields exist)
        if (
            !contractorData.contractor_email ||
            !contractorData.contractor_name ||
            !contractorData.contractor_id ||
            !contractorData.inviteLink || // Ensure inviteLink is present
            !contractorData.businessId ||
            !contractorData.businessname
        ) {
            console.error("Missing required contractor data:", contractorData);
            return;
        }

        if (contractorData.contractor_wallet) {
            console.error("Mailed already sent to:", contractorData);
            return;
        }

        const db = getFirestore(adminApp);

        // Construct email data (similar to your frontend, but retrieved from Firestore)
        const emailData = {
            to: contractorData.contractor_email,
            message: {
                subject: `Invitation to Add Wallet Address to ${contractorData.businessname} Payroll System`,
                text: `Hello ${contractorData.contractor_name},\n\nYou have been invited to Add your wallet Address to Trivix payroll system.\n\nPlease click the following link to connect your wallet and complete your registration:\n\n${contractorData.inviteLink}\n\nBest regards,\nTeam`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hi ${contractorData.contractor_name},</h2>
            <p>You have been Sent an invitation to add your wallet address to ${contractorData.businessname} payroll system. To complete the process, please connect your wallet using the link below:</p>
            <p>${contractorData.inviteLink}</p>
            <p>Best regards,<br>${contractorData.businessname} Team</p>
          </div>
        `,
            },

            attachments: [],
        };

        // Add email to the 'mail' collection. The Trigger Email extension will handle the rest.
        try {
            const contractor_id = contractorData.contractor_id;
            await db
                .collection("mail")
                .doc(`${contractor_id}_invitation`)
                .set(emailData);
            console.log(
                `Email queued for contractor: ${contractorData.contractor_email}`
            );
        } catch (error) {
            console.error("Error adding email to queue:", error);
        }
    }
);

exports.updateContractorProfile = onDocumentCreated(
    "Contractors/{company_id}/contractor/{contractor_id}",
    async (event) => {
        try {
            const { company_id, contractor_id } = event.params;
            const contractorData = event.data.data();
            const account = { address: contractorData.contractor_wallet };

            // Input Validation - Production Ready Code MUST Validate Inputs
            if (!company_id) {
                throw new Error("Company ID is missing in event parameters.");
            }
            if (!contractor_id) {
                throw new Error("Contractor ID is missing in event parameters.");
            }
            if (!contractorData) {
                throw new Error("Contractor data is missing from event data.");
            }
            if (!account.address) {
                throw new Error(
                    "Contractor wallet address is missing in contractor data."
                );
            }

            // Validate if company exists and get its wallet address
            const companySnap = await db.collection("users").doc(company_id).get();

            if (!companySnap.exists) {
                throw new Error(`Company with ID: ${company_id} does not exist`); // More descriptive error
            }

            const companyData = companySnap.data();
            const companyWalletAddress = companyData.wallet_address;

            if (!companyWalletAddress) {
                throw new Error(
                    `Company wallet address not found for company ID: ${company_id}`
                ); // More descriptive error
            }

            // Update contractor document with new data in "Contractors" collection
            await db
                .collection("Contractors")
                .doc(company_id)
                .collection("contractors")
                .doc(contractor_id)
                .set(
                    {
                        contractor_wallet: account.address,
                        status: "active",
                        company_id: company_id,
                        company_wallet: companyWalletAddress,
                        updatedAt: FieldValue.serverTimestamp(), // Use FieldValue.serverTimestamp
                    },
                    { merge: true }
                );

            const contractor_wallet = account.address; // Consider if toUpperCase() is always needed

            await db
                .collection("businesses")
                .doc(companyWalletAddress)
                .collection("contractors")
                .doc(contractor_id)
                .set(
                    {
                        contractor_wallet: contractor_wallet,
                        status: "unpaid",
                        updatedAt: FieldValue.serverTimestamp(),
                    },
                    { merge: true }
                );

            return {
                success: true,
                message: "Contractor profile updated successfully",
                contractorId: contractor_id,
                companyId: company_id,
            };
        } catch (error) {
            console.error(
                "PRODUCTION ERROR - updateContractorProfile failed:",
                error
            );

            throw new Error(
                `PRODUCTION ERROR - Failed to update contractor profile: ${error.message}`
            );
        }
    }
);

async function sendPayrollDataToAPI(workers, businessWalletAddress) {
    try {
        // Format the data according to API requirements
        const jsonData = {
            data: Array.isArray(workers)
                ? workers.map((worker) => ({
                    address: worker.worker_wallet,
                    amount: worker.worker_salary,
                }))
                : [
                    {
                        address: workers.worker_wallet,
                        amount: workers.worker_salary,
                    },
                ],
            employer: businessWalletAddress,
        };

        logger.info("Sending payroll data to API:", jsonData);

        // Send data to API
        const response = await fetch(
            "https://trib-backend-flow.vercel.app/api/senddata",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(jsonData),
            }
        );

        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        const responseData = await response.json();
        logger.info("Successfully sent payroll data to API:", responseData);
        return responseData;
    } catch (error) {
        logger.error("Error sending payroll data to API:", error);
        throw error;
    }
}

exports.scheduledPayrollWorker = onSchedule(
    "every day 00:00",
    async (event) => {
        logger.info("Payroll schedule check started", { structuredData: true });

        try {
            const businessesSnapshot = await db.collection("businesses").get();
            if (businessesSnapshot.empty) {
                logger.info("No businesses found in Firestore.");
                return; // Exit if no businesses
            }

            for (const businessDoc of businessesSnapshot.docs) {
                try {
                    const businessData = businessDoc.data();
                    const businessId = businessDoc.id;
                    const companyEmail = businessData.email;
                    const businessWalletAddress = businessData.companyWalletAddress;
                    const nextPaymentDateTimestamp =
                        businessData.settings?.nextPaymentDate;
                    const paymentInterval =
                        businessData.settings?.paymentInterval || "Monthly";
                    const paymentDay =
                        businessData.settings?.paymentDay || "Last working day";
                    const specificDateSetting = businessData.settings?.specificDate || 1;
                    const selectedWeeklyDaySetting =
                        businessData.settings?.selectedWeeklyDay;

                    if (!businessData.name) {
                        logger.warn(
                            `Business name is missing for businessId: ${businessId}. Skipping payroll check.`
                        );
                        continue;
                    }

                    if (!nextPaymentDateTimestamp) {
                        logger.info(
                            `No next payment date set for business: ${businessId}, ${businessData.name}. Skipping payroll check.`
                        );
                        continue;
                    }

                    const nextPaymentDate = nextPaymentDateTimestamp.toDate();
                    const currentDate = new Date();

                    logger.debug(
                        `Checking payroll for business: ${businessId}, ${businessData.name}. Next Payment Date: ${nextPaymentDate}, Current Date: ${currentDate}`
                    );

                    if (nextPaymentDate <= currentDate) {
                        logger.info(
                            `Payroll is due for business: ${businessId}, ${businessData.name}. Processing payroll...`
                        );

                        let workersSnapshot;
                        try {
                            workersSnapshot = await db
                                .collection("businesses")
                                .doc(businessId)
                                .collection("workers")
                                .get();
                        } catch (error) {
                            logger.error(
                                `Error fetching workers for business: ${businessId}, ${businessData.name}`,
                                error
                            );
                            continue; // Skip to the next business if workers cannot be fetched
                        }

                        if (workersSnapshot.empty) {
                            logger.info(
                                `No workers found for business: ${businessId}, ${businessData.name}. Skipping payroll processing.`
                            );
                            continue; // No workers, nothing to process, move to next business
                        }

                        const workersInfo = [];
                        const successfulPayments = [];
                        const failedPayments = [];

                        for (const workerDoc of workersSnapshot.docs) {
                            try {
                                const workerData = workerDoc.data();
                                const workerId = workerDoc.id; // Explicitly get workerId
                                const workerInfo = {
                                    worker_name: workerData.worker_name,
                                    role: workerData.role,
                                    status: workerData.status,
                                    worker_wallet: workerData.worker_wallet,
                                    worker_salary: workerData.worker_salary,
                                    worker_email: workerData.worker_email,
                                    worker_id: workerId, // Use explicit workerId
                                };

                                if (
                                    workerData.status === "active" &&
                                    workerData.worker_salary !== undefined &&
                                    workerData.worker_wallet
                                ) {
                                    // Ensure salary and wallet are present for active workers
                                    workersInfo.push(workerInfo);
                                    logger.info(
                                        `Processing payment for active worker: ${workerData.worker_name}, workerId: ${workerId}, business: ${businessId}, ${businessData.companyWalletAddress}`
                                    );

                                    const workers = workerInfo;
                                    // Send payroll data to API before processing emails

                                    try {
                                        await sendPayrollDataToAPI(workers, businessWalletAddress);
                                        successfulPayments.push(workerInfo);
                                    } catch (apiError) {
                                        logger.error(
                                            `Error sending payroll data to API for worker: ${workerData.worker_name}`,
                                            apiError
                                        );
                                        failedPayments.push(workerInfo);
                                    }

                                    await sendWorkerPaymentEmail(
                                        workerInfo,
                                        businessData.name
                                    ).catch((emailError) => {
                                        logger.error(
                                            `Error sending payment email to worker: ${workerData.worker_name}, workerId: ${workerId}, business: ${businessId}, ${businessData.name}`,
                                            emailError
                                        );
                                        // Consider if you want to mark this payment as failed if email fails, or handle email failures separately.
                                        failedPayments.push(workerInfo); // Add to failed payments if email sending fails to track.
                                        successfulPayments.pop(); // Remove from successful payments as email confirmation failed.
                                    });
                                } else {
                                    failedPayments.push(workerInfo);
                                    let reason = "";
                                    if (workerData.status !== "active")
                                        reason += "Inactive status; ";
                                    if (workerData.worker_salary === undefined)
                                        reason += "Salary not defined; ";
                                    if (!workerData.worker_wallet)
                                        reason += "Wallet not provided; ";

                                    logger.warn(
                                        `Payroll skipped for worker: ${workerData.worker_name}, workerId: ${workerId}, business: ${businessId}, ${businessData.name} - Reason: ${reason}`
                                    );
                                }
                            } catch (workerProcessingError) {
                                logger.error(
                                    `Error processing worker: ${workerDoc.id} for business: ${businessId}, ${businessData.name}`,
                                    workerProcessingError
                                );
                                // Continue processing other workers even if one fails.
                            }
                        }

                        try {
                            await sendCompanyPayrollReportEmail(
                                companyEmail,
                                businessData.name,
                                successfulPayments,
                                failedPayments
                            );
                        } catch (reportEmailError) {
                            logger.error(
                                `Error sending company payroll report email for business: ${businessId}, ${businessData.name}`,
                                reportEmailError
                            );
                        }

                        let calculatedNextPaymentDate;
                        try {
                            calculatedNextPaymentDate = calculateNextPaymentDate(
                                paymentInterval,
                                paymentDay, // Correctly pass paymentDay
                                specificDateSetting // Correctly pass specificDateSetting
                            );
                        } catch (dateCalculationError) {
                            logger.error(
                                `Error calculating next payment date for business: ${businessId}, ${businessData.name}`,
                                dateCalculationError
                            );
                            continue; // Skip date update if calculation fails, to prevent further issues.
                        }

                        try {
                            await db
                                .collection("businesses")
                                .doc(businessId)
                                .update({
                                    "settings.nextPaymentDate":
                                        admin.firestore.Timestamp.fromDate(
                                            calculatedNextPaymentDate
                                        ),
                                });
                            logger.info(
                                `Next payment date updated for business: ${businessId}, ${businessData.name} to ${calculatedNextPaymentDate}`
                            );
                        } catch (dbUpdateError) {
                            logger.error(
                                `Error updating next payment date in businesses collection for business: ${businessId}, ${businessData.name}`,
                                dbUpdateError
                            );
                        }

                        try {
                            const scheduleDocRef = db
                                .collection("businesses")
                                .doc(businessId)
                                .collection("payroll_schedules")
                                .doc("current");

                            const scheduleData = {
                                paymentInterval,
                                paymentDay:
                                    paymentInterval === "Monthly"
                                        ? paymentDay
                                        : selectedWeeklyDaySetting,
                                specificDate:
                                    paymentInterval === "Monthly" ? specificDateSetting : null,
                                nextPaymentDate: calculatedNextPaymentDate,
                                status: "active",
                                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                            };

                            await scheduleDocRef.set(scheduleData, { merge: true });
                            logger.info(
                                `Next payment date updated in payroll_schedules for business: ${businessId}, ${businessData.name}`
                            );
                        } catch (scheduleUpdateError) {
                            logger.error(
                                `Error updating payroll_schedules collection for business: ${businessId}, ${businessData.name}`,
                                scheduleUpdateError
                            );
                        }

                        logger.info(
                            `Payroll processing completed for business: ${businessId}, ${businessData.name}`
                        );
                        logger.debug("Processed workers info:", {
                            workersData: workersInfo,
                        });
                    } else {
                        logger.info(
                            `Payroll not yet due for business: ${businessId}, ${businessData.name}. Next Payment Date: ${nextPaymentDate}`
                        );
                    }
                } catch (businessProcessingError) {
                    logger.error(
                        `Error processing payroll for business: ${businessDoc.id}`,
                        businessProcessingError
                    );
                    // Continue to the next business even if one fails.
                }
            }
        } catch (topLevelError) {
            logger.error(
                "Error during scheduled payroll check execution:",
                topLevelError
            );
        }

        logger.info("Payroll schedule check finished", { structuredData: true });
    }
);

async function sendCompanyPayrollReportEmail(
    companyEmail,
    companyName,
    successfulPayments,
    failedPayments
) {
    if (!companyEmail) {
        logger.warn(
            `No company email available. Report email not sent for company: ${companyName}`
        );
        return;
    }

    const successfulList = successfulPayments
        .map(
            (worker) =>
                `- ${worker.worker_name} (${worker.role}) - Wallet: ${worker.worker_wallet
                }, Salary: ${formatCurrency(worker.worker_salary)}`
        )
        .join("\n");
    const failedList = failedPayments
        .map(
            (worker) =>
                `- ${worker.worker_name} (${worker.role}) - Status: ${worker.status}, Email: ${worker.worker_email}`
        )
        .join("\n");

    const emailData = {
        to: companyEmail,
        message: {
            subject: `Payroll Report for ${companyName} - ${formatDate(new Date())}`,
            text: `Worker Payroll Report for ${companyName} - ${formatDate(
                new Date()
            )}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Payroll Report - ${companyName} - ${formatDate(
                new Date()
            )}</h2>
                    <p>Dear ${companyName} Team,</p>
                    <p>Here is the payroll report for today:</p>

                    <h3>Successful Payments</h3>
                    ${successfulPayments.length > 0
                    ? `<pre>${successfulList}</pre>`
                    : "<p>No successful payments processed.</p>"
                }

                    <h3>Failed Payments (Workers with Issues)</h3>
                    ${failedPayments.length > 0
                    ? `<pre>${failedList}</pre>`
                    : "<p>No workers with failed payments or issues this payroll run.</p>" // More user-friendly message
                }

                    <p>Please review this report for any discrepancies.</p>
                    <p>Sincerely,<br/>Trivix Payroll System</p>
                </div>
            `,
        },
    };

    try {
        await db.collection("mail").add(emailData);
        logger.info(`Company report email queued for: ${companyEmail}`);
    } catch (error) {
        logger.error("Error queuing company report email:", error);
    }
}

async function sendWorkerPaymentEmail(workerInfo, companyName) {
    if (!workerInfo.worker_email) {
        logger.warn(
            `No worker email available. Payment email not sent for worker ID: ${workerInfo.worker_id}, workerName: ${workerInfo.worker_name}`
        );
        return;
    }

    const emailData = {
        to: workerInfo.worker_email,
        message: {
            subject: `Salary Payment Confirmation from ${companyName}`,
            text: `Salary Payment Confirmation for ${workerInfo.worker_name
                } from ${companyName}. Amount Paid: ${formatCurrency(
                    workerInfo.worker_salary
                )}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Salary Payment Confirmation</h2>
                    <p>Dear ${workerInfo.worker_name},</p>
                    <p>This is to confirm that your salary has been processed by ${companyName}.</p>
                    <p><strong>Amount Paid:</strong> ${formatCurrency(
                workerInfo.worker_salary
            )}</p>
                    <p>If you have any questions, please contact ${companyName} HR department.</p>
                    <p>Sincerely,<br/>${companyName} Team</p>
                </div>
            `,
        },
    };

    try {
        await db.collection("mail").add(emailData); // Add to mail collection
        logger.info(
            `Worker payment email queued for: ${workerInfo.worker_email}, workerId: ${workerInfo.worker_id}`
        );
    } catch (error) {
        logger.error("Error queuing worker payment email:", error);
        // Consider more robust error handling if email sending is critical.
    }
}

function formatDate(date) {
    try {
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch (error) {
        logger.error("Error formatting date:", error);
        return "Date Formatting Error"; // Return a user-friendly error string
    }
}

function formatCurrency(amount) {
    if (amount === undefined || amount === null) {
        logger.warn("Currency amount is undefined or null, returning $0.00");
        return "$0.00"; // Handle undefined or null amounts gracefully
    }
    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    } catch (error) {
        logger.error("Error formatting currency:", error);
        return "Currency Formatting Error"; // Return a user-friendly error string
    }
}

function calculateNextPaymentDate(interval, paymentDay, specificDateSetting) {
    // Input Validation: Ensure interval is provided and valid
    if (!interval) {
        throw new Error("Payment interval is required.");
    }
    const validIntervals = ["Weekly", "Monthly"];
    if (!validIntervals.includes(interval)) {
        throw new Error(
            `Invalid payment interval: ${interval}. Must be one of: ${validIntervals.join(
                ", "
            )}`
        );
    }

    // Input Validation for Weekly interval
    if (interval === "Weekly") {
        if (!paymentDay) {
            throw new Error("Payment day is required for weekly interval.");
        }
        const validWeeklyDays = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ];
        if (!validWeeklyDays.includes(paymentDay)) {
            throw new Error(
                `Invalid payment day for weekly interval: ${paymentDay}. Must be one of: ${validWeeklyDays.join(
                    ", "
                )}`
            );
        }
    }

    // Input Validation for Monthly interval
    if (interval === "Monthly") {
        const validMonthlyPaymentDays = [
            "Last working day",
            "Last day of month",
            "Specific date",
        ];
        if (!paymentDay) {
            throw new Error("Payment day type is required for monthly interval.");
        }
        if (
            !validMonthlyPaymentDays.includes(paymentDay) &&
            paymentDay !== "Specific date"
        ) {
            // To allow "Specific date" handling later
            throw new Error(
                `Invalid payment day type for monthly interval: ${paymentDay}. Must be one of: ${validMonthlyPaymentDays.join(
                    ", "
                )} or 'Specific date'`
            );
        }

        if (paymentDay === "Specific date") {
            const dayOfMonth = parseInt(specificDateSetting, 10);
            if (isNaN(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
                throw new Error(
                    `Invalid specific date for monthly interval: ${specificDateSetting}. Must be a number between 1 and 31.`
                );
            }
        }
    }

    const today = new Date();
    let nextPaymentDate = new Date();

    switch (interval) {
        case "Weekly":
            const weekdays = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ];
            const currentDayIndex = today.getDay(); // Sunday is 0, Monday is 1, etc.
            const targetDayIndex = weekdays.indexOf(paymentDay);

            let daysToAdd = targetDayIndex - currentDayIndex;
            if (daysToAdd <= 0) {
                daysToAdd += 7; // If target day is today or in the past, add 7 days to get next week's day
            }
            nextPaymentDate.setDate(today.getDate() + daysToAdd);
            break;

        case "Monthly":
            nextPaymentDate.setMonth(today.getMonth() + 1); // Set to next month initially

            if (paymentDay === "Last working day") {
                nextPaymentDate.setDate(1); // Set to the first day of next month
                nextPaymentDate.setDate(0); // Then set day to 0 to get the last day of the *previous* month (which is the current target month's last day)

                // Check if last day of month is a weekend, and adjust backwards if needed to find the last working day (Friday)
                while (
                    nextPaymentDate.getDay() === 0 ||
                    nextPaymentDate.getDay() === 6
                ) {
                    // 0: Sunday, 6: Saturday
                    nextPaymentDate.setDate(nextPaymentDate.getDate() - 1);
                }
            } else if (paymentDay === "Last day of month") {
                nextPaymentDate.setDate(1); // Set to the first day of next month
                nextPaymentDate.setDate(0); // Then set day to 0 to get the last day of the *previous* month (which is the current target month's last day)
            } else if (paymentDay === "Specific date") {
                const dayOfMonth = parseInt(specificDateSetting, 10);
                nextPaymentDate.setDate(dayOfMonth);

                // Handle cases where the specific date falls on a weekend, push to next Monday
                if (nextPaymentDate.getDay() === 0 || nextPaymentDate.getDay() === 6) {
                    nextPaymentDate.setDate(
                        nextPaymentDate.getDate() + (nextPaymentDate.getDay() === 6 ? 2 : 1)
                    ); // Move to Monday if Sunday or Saturday
                }
                // If the calculated date is in the past within the current month, move to next month
                if (
                    nextPaymentDate.getDate() < today.getDate() &&
                    nextPaymentDate.getMonth() === today.getMonth() &&
                    nextPaymentDate.getFullYear() === today.getFullYear()
                ) {
                    nextPaymentDate.setMonth(today.getMonth() + 1);
                    nextPaymentDate.setDate(dayOfMonth);
                    if (
                        nextPaymentDate.getDay() === 0 ||
                        nextPaymentDate.getDay() === 6
                    ) {
                        nextPaymentDate.setDate(
                            nextPaymentDate.getDate() +
                            (nextPaymentDate.getDay() === 6 ? 2 : 1)
                        ); // Move to Monday if Sunday or Saturday
                    }
                }
            }
            break;

        default: // Should not reach here due to interval validation at the beginning
            throw new Error(`Unexpected payment interval: ${interval}`);
    }

    // Final check: Ensure nextPaymentDate is not in the past (especially important for monthly calculations that might fall back)
    if (nextPaymentDate < today) {
        logger.warn(
            `Calculated next payment date ${nextPaymentDate} is in the past. Adjusting to next valid date.`
        );
        if (interval === "Weekly") {
            nextPaymentDate.setDate(nextPaymentDate.getDate() + 7); // For weekly, just add 7 days.
        } else if (interval === "Monthly") {
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1); // For monthly, move to next month and recalculate day.
            if (paymentDay === "Specific date") {
                const dayOfMonth = parseInt(specificDateSetting, 10);
                nextPaymentDate.setDate(dayOfMonth);
                if (nextPaymentDate.getDay() === 0 || nextPaymentDate.getDay() === 6) {
                    nextPaymentDate.setDate(
                        nextPaymentDate.getDate() + (nextPaymentDate.getDay() === 6 ? 2 : 1)
                    );
                }
            } else if (paymentDay === "Last working day") {
                nextPaymentDate.setDate(1);
                nextPaymentDate.setDate(0);
                while (
                    nextPaymentDate.getDay() === 0 ||
                    nextPaymentDate.getDay() === 6
                ) {
                    nextPaymentDate.setDate(nextPaymentDate.getDate() - 1);
                }
            } else if (paymentDay === "Last day of month") {
                nextPaymentDate.setDate(1);
                nextPaymentDate.setDate(0);
            }
        }
    }

    // Re-check for weekend again after potential adjustments
    if (interval === "Monthly" && paymentDay === "Specific date") {
        // Only for specific dates in monthly, others are already handled or inherently not weekend dependant.
        while (nextPaymentDate.getDay() === 0 || nextPaymentDate.getDay() === 6) {
            nextPaymentDate.setDate(
                nextPaymentDate.getDate() + (nextPaymentDate.getDay() === 6 ? 2 : 1)
            );
        }
    }

    return nextPaymentDate;
}

exports.onPayrollManuallyPaid = onDocumentCreated(
    "businesses/{businessId}/payrolls/{payrollId}",
    async (event) => {
        const payrollSnapshot = event.data;
        if (!payrollSnapshot) {
            logger.error("No data associated with the payroll creation event");
            return;
        }

        const payrollData = payrollSnapshot.data();
        const businessId = event.params.businessId;
        const payrollId = event.params.payrollId;

        if (payrollData.payrollStatus === "Success") {
            logger.info(
                `Payroll ${payrollId} for business ${businessId} was successful, sending emails.`
            );

            const recipients = payrollData.recipients;
            const totalAmount = payrollData.totalAmount;
            const transactionHash =
                payrollData.transactionHash || "Manual Payroll - No Transaction Hash";

            let businessData;
            try {
                const businessDoc = await db
                    .collection("businesses")
                    .doc(businessId)
                    .get();
                if (!businessDoc.exists) {
                    logger.error(
                        `Business document not found for businessId: ${businessId}`
                    );
                    return;
                }
                businessData = businessDoc.data();
            } catch (error) {
                logger.error(
                    `Error fetching business data for businessId: ${businessId}`,
                    error
                );
                return;
            }

            const companyName = businessData.name;
            const companyEmail = businessData.email;

            if (recipients && recipients.length > 0) {
                const successfulPaymentsForReport = []; // To accumulate successful payments for the company report
                const failedPaymentsForReport = []; //  To accumulate failed payments (though in this context, failures are less likely if payrollStatus is "Success", but good to have)

                for (const recipient of recipients) {
                    try {
                        await sendWorkerPaymentEmailForManualPayroll(
                            recipient,
                            companyName,
                            transactionHash // Pass transactionHash to worker email
                        );
                        successfulPaymentsForReport.push({
                            // Structure data for company report (similar to scheduled payroll)
                            worker_name: recipient.recipientName,
                            role: "N/A (Manual Payroll)", // Role might not be readily available in manual payroll data
                            status: "active", // Assuming they are active if being paid manually
                            worker_wallet: recipient.recipientWalletAddress,
                            worker_salary: recipient.amount,
                            worker_email: recipient.recipientEmail,
                            worker_id: recipient.workerId, // Assuming workerId is present in recipients
                        });
                    } catch (error) {
                        logger.error(
                            `Error sending payment email to worker ${recipient.recipientName} (${recipient.recipientEmail}) for manual payroll ${payrollId}`,
                            error
                        );
                        failedPaymentsForReport.push({
                            // Add to failed for company report if email fails
                            worker_name: recipient.recipientName,
                            role: "N/A (Manual Payroll)",
                            status: "unknown", // Status unknown as payment status is success, but email failed
                            worker_wallet: recipient.recipientWalletAddress,
                            worker_salary: recipient.amount,
                            worker_email: recipient.recipientEmail,
                            worker_id: recipient.workerId,
                        });
                    }
                }

                try {
                    await sendCompanyPayrollReportEmailForManualPayroll(
                        // Modified function for manual payroll report
                        companyEmail,
                        companyName,
                        successfulPaymentsForReport,
                        failedPaymentsForReport,
                        payrollId,
                        transactionHash,
                        totalAmount // Pass totalAmount to company report
                    );
                } catch (error) {
                    logger.error(
                        `Error sending company payroll report email for manual payroll ${payrollId}`,
                        error
                    );
                }
            } else {
                logger.warn(`No recipients found in payroll data for ${payrollId}`);
            }
        } else {
            logger.warn(
                `Payroll ${payrollId} for business ${businessId} was not successful (status: ${payrollData.payrollStatus}), emails not sent.`
            );
            // Optionally handle failed payroll status, maybe send an error email to the business admin?
        }
    }
);

async function sendWorkerPaymentEmailForManualPayroll(
    workerInfo,
    companyName,
    transactionHash
) {
    if (!workerInfo.recipientEmail) {
        // Use recipientEmail from workerInfo
        logger.warn(
            `No worker email available. Payment email not sent for worker ID: ${workerInfo.workerId}, workerName: ${workerInfo.recipientName}` // Use recipientName
        );
        return;
    }

    const emailData = {
        to: workerInfo.recipientEmail, // Use recipientEmail
        message: {
            subject: `Salary Payment Confirmation from ${companyName}`,
            text: `Salary Payment Confirmation for ${workerInfo.recipientName // Use recipientName
                } from ${companyName}. Amount Paid: ${formatCurrency(
                    workerInfo.amount // Use amount
                )}. Transaction Hash: ${transactionHash}`, // Include transaction hash
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Salary Payment Confirmation</h2>
                    <p>Dear ${workerInfo.recipientName},</p>
                    <p>This is to confirm that your salary has been processed by ${companyName} via manual payroll.</p>
                    <p><strong>Amount Paid:</strong> ${formatCurrency(
                workerInfo.amount // Use amount
            )}</p>
                    <p><strong>Transaction Hash:</strong> ${transactionHash}</p>
                    <p><strong>Transaction Hash:</strong> <a href="https://sepolia.arbiscan.io/tx/${transactionHash}">View Transaction</a></p>
                    <p>If you have any questions, please contact ${companyName} HR department.</p>
                    <p>Sincerely,<br/>${companyName} Team</p>
                </div>
            `,
        },
    };

    try {
        await db.collection("mail").add(emailData); // Add to mail collection
        logger.info(
            `Worker payment email queued for manual payroll: ${workerInfo.recipientEmail}, workerId: ${workerInfo.workerId}` // Use recipientEmail and workerId
        );
    } catch (error) {
        logger.error(
            "Error queuing worker payment email for manual payroll:",
            error
        );
        // Consider more robust error handling if email sending is critical.
    }
}

async function sendCompanyPayrollReportEmailForManualPayroll(
    companyEmail,
    companyName,
    successfulPayments,
    failedPayments,
    payrollId,
    transactionHash,
    totalAmount // Add totalAmount to function signature
) {
    if (!companyEmail) {
        logger.warn(
            `No company email available. Report email not sent for company: ${companyName}`
        );
        return;
    }

    const successfulList = successfulPayments
        .map(
            (worker) =>
                `- ${worker.worker_name} (${worker.role}) - Wallet: ${worker.worker_wallet
                }, Salary: ${formatCurrency(worker.worker_salary)}`
        )
        .join("\n");
    const failedList = failedPayments
        .map(
            (worker) =>
                `- ${worker.worker_name} (${worker.role}) - Status: ${worker.status}, Email: ${worker.worker_email}`
        )
        .join("\n");

    const emailData = {
        to: companyEmail,
        message: {
            subject: `Manual Payroll Report for ${companyName} - Payroll ID: ${payrollId} - ${formatDate(
                new Date()
            )}`, // Include payroll ID in subject
            text: `Manual Worker Payroll Report for ${companyName} - Payroll ID: ${payrollId} - ${formatDate(
                new Date()
            )}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Manual Payroll Report - ${companyName} - Payroll ID: ${payrollId} - ${formatDate(
                new Date()
            )}</h2>
                    <p>Dear ${companyName} Team,</p>
                    <p>Here is the manual payroll report for Payroll ID: <strong>${payrollId}</strong>, Transaction Hash: <strong>${transactionHash}</strong>, Total Amount: <strong>${formatCurrency(
                totalAmount
            )}</strong>:</p>

                    <h3>Successful Payments</h3>
                    ${successfulPayments.length > 0
                    ? `<pre>${successfulList}</pre>`
                    : "<p>No successful payments processed in this manual payroll.</p>"
                }

                    <h3>Workers with Issues (If any)</h3>
                    ${failedPayments.length > 0
                    ? `<pre>${failedList}</pre>`
                    : "<p>No workers with failed payments or issues in this manual payroll run.</p>" // More user-friendly message
                }

                    <p>Please review this report for your records.</p>
                    <p>Sincerely,<br/>Trivix Payroll System</p>
                </div>
            `,
        },
    };

    try {
        await db.collection("mail").add(emailData);
        logger.info(
            `Company manual payroll report email queued for: ${companyEmail}, Payroll ID: ${payrollId}`
        );
    } catch (error) {
        logger.error("Error queuing company manual payroll report email:", error);
    }
}
