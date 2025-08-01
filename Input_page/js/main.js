/**
 * Main application logic for the CargoVortex cargo input interface
 */
document.addEventListener("DOMContentLoaded", function () {
  // Initialize global variables
  let tableManager = null;

  try {
    // Initialize TableManager
    tableManager = new TableManager(
      "cargoTable",
      CONFIG.TABLE_COLUMNS,
      CONFIG.DEFAULT_ROW
    );
    tableManager.initialize();

  } catch (error) {
    console.error("Error initializing application:", error);
    Swal.fire({
      title: "Initialization Error",
      text: "There was an error starting the application. Please refresh the page.",
      icon: "error",
    });
    return;
  }

  // Check for saved data
  if (tableManager && tableManager.loadFromLocalStorage()) {
    // Show session restore modal
    const sessionModalElement = document.getElementById("sessionRestoreModal");
    if (sessionModalElement) {
      const sessionModal = new bootstrap.Modal(sessionModalElement);
      sessionModal.show();

      // Handle restore button
      const restoreButton = document.getElementById("restoreSessionButton");
      if (restoreButton) {
        restoreButton.addEventListener("click", function () {
          sessionModal.hide();
          Swal.fire({
            title: "Session Restored",
            text: "Your previous cargo data has been loaded.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        });
      }

      // Handle Start Fresh button
      const startFreshButton = document.querySelector("#sessionRestoreModal .btn-secondary");
      if (startFreshButton) {
        startFreshButton.addEventListener("click", function () {
          tableManager.clearData();
          sessionModal.hide();
          Swal.fire({
            title: "Fresh Start",
            text: "Starting with a clean cargo table.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        });
      }
    }
  }

  // Handle Save Draft button
  const saveButton = document.getElementById("saveButton");
  if (saveButton && tableManager) {
    saveButton.addEventListener("click", function () {
      const data = tableManager.getData();
      if (data.length > 0) {
        tableManager.saveToLocalStorage();
        Swal.fire({
          title: "Saved",
          text: `Your cargo data (${data.length} items) has been saved locally.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          title: "No Data to Save",
          text: "Please add some cargo items before saving.",
          icon: "info",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  }

  // Handle Clear All button
  const clearAllButton = document.getElementById("clearAllButton");
  if (clearAllButton && tableManager) {
    clearAllButton.addEventListener("click", function () {
      Swal.fire({
        title: "Clear All Data?",
        text: "Are you sure you want to clear all cargo data? This cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, clear it!",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          tableManager.clearData();
          Swal.fire({
            title: "Cleared",
            text: "All cargo data has been cleared.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      });
    });
  }

  // Handle Add Row button
  const addRowButton = document.getElementById("addRowButton");
  if (addRowButton && tableManager) {
    addRowButton.addEventListener("click", function () {
      tableManager.addRow();
    });
  }

  // Handle Remove Selected button
  const removeRowButton = document.getElementById("removeRowButton");
  if (removeRowButton && tableManager) {
    removeRowButton.addEventListener("click", function () {
      tableManager.removeSelectedRows();
    });
  }

  // Handle Undo button
  const undoButton = document.getElementById("undoButton");
  if (undoButton && tableManager) {
    undoButton.addEventListener("click", function () {
      tableManager.undo();
    });
  }

  // Handle Redo button
  const redoButton = document.getElementById("redoButton");
  if (redoButton && tableManager) {
    redoButton.addEventListener("click", function () {
      tableManager.redo();
    });
  }

  // Handle AI Fill button
  const aiFillButton = document.getElementById("aiFillButton");
  if (aiFillButton && tableManager) {
    aiFillButton.addEventListener("click", function () {
      tableManager.showAiFillModal();
    });
  }

  // Handle Upload button
  const uploadButton = document.getElementById("uploadButton");
  const fileInput = document.getElementById("fileInput");
  if (uploadButton && fileInput) {
    uploadButton.addEventListener("click", function () {
      fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener("change", async function (e) {
      if (!e.target.files || e.target.files.length === 0) return;
      if (!tableManager || !window.exportService) {
        Swal.fire({
          title: "Service Error",
          text: "Export service is not available.",
          icon: "error",
        });
        return;
      }

      const file = e.target.files[0];

      // Show loading
      Swal.fire({
        title: "Processing File",
        html: "Please wait while we process your file...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        // Import the file
        const importedData = await window.exportService.importFromFile(file);

        // Update table with imported data
        tableManager.setDataFromFile(importedData);

        // Show success message
        Swal.fire({
          title: "Import Successful",
          text: `Imported ${importedData.length} cargo items.`,
          icon: "success",
        });
      } catch (error) {
        console.error("Error importing file:", error);
        Swal.fire({
          title: "Import Failed",
          text: "Could not process the file. Please check the format and try again.",
          icon: "error",
        });
      }

      // Reset file input
      e.target.value = "";
    });
  }

  // Handle Export to Excel
  const exportExcelButton = document.getElementById("exportExcel");
  if (exportExcelButton && tableManager) {
    exportExcelButton.addEventListener("click", function () {
      if (!window.exportService) {
        Swal.fire({
          title: "Service Error",
          text: "Export service is not available.",
          icon: "error",
        });
        return;
      }
      const data = tableManager.getData();
      const validationStatus = tableManager.getValidationStatus();
      window.exportService.exportToExcel(data, validationStatus);
    });
  }

  // Handle Export to CSV
  const exportCSVButton = document.getElementById("exportCSV");
  if (exportCSVButton && tableManager) {
    exportCSVButton.addEventListener("click", function () {
      if (!window.exportService) {
        Swal.fire({
          title: "Service Error",
          text: "Export service is not available.",
          icon: "error",
        });
        return;
      }
      const data = tableManager.getData();
      const validationStatus = tableManager.getValidationStatus();
      window.exportService.exportToCSV(data, validationStatus);
    });
  }

  // Handle Continue to Optimization button
  const continueButton = document.getElementById("continueButton");
  if (continueButton && tableManager) {
    continueButton.addEventListener("click", function () {
      const data = tableManager.getData();
      const validationStatus = tableManager.getValidationStatus();

      // First check for validation issues
      if (validationStatus && validationStatus.hasIssues) {
        Swal.fire({
          title: "Validation Issues Found",
          html: `
            <div class="validation-warning">
              <p class="mb-2">Your cargo data has ${
                validationStatus.totalIssues
              } validation ${
            validationStatus.totalIssues === 1 ? "issue" : "issues"
          } in ${validationStatus.itemsAffected} ${
            validationStatus.itemsAffected === 1 ? "item" : "items"
          }.</p>
              
              <div class="alert alert-warning">
                <ul class="mb-0 text-start">
                  ${validationStatus.issues
                    .slice(0, 5) // Show max 5 issues
                    .map(
                      (issue) =>
                        `<li><strong>${issue.itemName}</strong>: ${issue.message} (${issue.field})</li>`
                    )
                    .join("")}
                  ${
                    validationStatus.issues.length > 5
                      ? `<li>...and ${
                          validationStatus.issues.length - 5
                        } more issues</li>`
                      : ""
                  }
                </ul>
              </div>
              
              <p>Do you want to proceed anyway?</p>
            </div>
          `,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Continue to Optimization anyway",
          cancelButtonText: "Go back and fix issues",
        }).then((result) => {
          if (result.isConfirmed) {
            // Continue to optimization page despite warnings
            window.location.href = "../optimization/index.html";
          }
        });
        return;
      }

      // Check if export is needed (no validation issues)
      if (window.exportService && window.exportService.isExportNeeded(data)) {
        Swal.fire({
          title: "Export Recommended",
          text: "You have not exported your data recently. Would you like to export it now?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes, export",
          cancelButtonText: "Continue without exporting",
        }).then((result) => {
          if (result.isConfirmed) {
            // Export to Excel
            const exported = window.exportService.exportToExcel(data);

            if (exported) {
              // Redirect to optimization page
              setTimeout(() => {
                window.location.href = "../optimization/index.html";
              }, 1000);
            }
          } else {
            // Redirect to optimization page
            window.location.href = "../optimization/index.html";
          }
        });
      } else {
        // No export needed, redirect to optimization page
        window.location.href = "../optimization/index.html";
      }
    });
  }

  // Review tab activation
  const reviewTab = document.getElementById("review-tab");
  if (reviewTab && tableManager) {
    reviewTab.addEventListener("click", function () {
      // Create preview table when tab is selected
      tableManager.createPreviewTable("previewTable");

      // Update data statistics
      const data = tableManager.getData();
      tableManager.updateDataStats(data);
    });
  }

  // Theme switcher
  const themeSwitcher = document.getElementById("themeSwitcher");
  if (themeSwitcher) {
    themeSwitcher.addEventListener("click", function () {
      document.body.classList.toggle("dark-mode");

      // Update button
      const themeButton = this;
      const icon = themeButton.querySelector("i");

      if (document.body.classList.contains("dark-mode")) {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
        themeButton.innerHTML = icon.outerHTML + " Light Mode";
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, "dark");
      } else {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
        themeButton.innerHTML = icon.outerHTML + " Dark Mode";
        localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, "light");
      }
    });

    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
    if (savedTheme === "dark") {
      themeSwitcher.click();
    }
  }
  // Network connection monitoring
  window.addEventListener("offline", function () {
    Swal.fire({
      title: "Network Connection Lost",
      text: "You are currently offline. Some features like AI suggestions may not work.",
      icon: "warning",
      toast: true,
      position: "top-end",

      showConfirmButton: false,
      timer: 3000,
    });
  });
});
