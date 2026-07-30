function doPost(e) {
  try {
    var data = JSON.parse((e.postData && e.postData.contents) || "{}");
    var sheetName = (data.sheetName || "").trim();
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (!sheetName) {
      return jsonResponse({ status: "error", message: "Missing sheetName" });
    }

    var sheetConfigs = {
      All_Enquiry: {
        rowOrder: [
          "companyName",
          "verticalType",
          "country",
          "state",
          "fullName",
          "noOfPeople",
          "mobileNumber",
          "email",
          "startDate",
          "endDate",
          "source",
          "productType",
        ],
      },
      All_POC_Contact: {
        headerMap: {
          "POC Name": "pocName",
          "POC Company": "pocCompany",
          "POC Designation": "pocDesignation",
          "Full Name": "fullName",
          Mobile: "mobile",
          Email: "email",
        },
      },
      Connect_with_us: {
        headerMap: {
          Name: "name",
          Email: "email",
          Mobile: "mobile",
          "Type Of Partnership": "typeOfPartnerShip",
          Message: "message",
        },
      },
      Sign_up: {
        headerMap: {
          "First Name": "firstName",
          "Last Name": "lastName",
          Email: "email",
          Password: "password",
          Mobile: "mobile",
          "Reason For Signup": "reason",
        },
      },
      Content_Removal_Requests: {
        headerMap: {
          "Full Name": "fullName",
          Mobile: "mobile",
          Email: "email",
          "Company Name": "companyName",
          Designation: "designation",
          URL: "urls",
          Source: "source",
        },
      },
      AI_Visa_Support: {
        headerMap: {
          "Visa Type": "visaType",
          "Full Name": "fullName",
          Nationality: "nationality",
          "Travelling Country": "travellingCountry",
          Email: "email",
          "Contact Code": "contactCode",
          "Contact Number": "contactNumber",
          Comments: "comments",
          "Submitted At": "submittedAt",
        },
      },
      AI_Overall_Activation_Support: {
        headerMap: {
          "Support Required": "supportRequired",
          "Full Name": "fullName",
          "Nationality On Passport": "nationalityOnPassport",
          "Travel Country": "travelCountry",
          Email: "email",
          "Contact Code": "contactCode",
          "Contact Number": "contactNumber",
          Comments: "comments",
          "Submitted At": "submittedAt",
        },
      },
      AI_New_Company_Setup: {
        headerMap: {
          "Support Required": "supportRequired",
          "Full Name": "fullName",
          "Current Company Country": "currentCompanyCountry",
          "New Company Country": "newCompanyCountry",
          Email: "email",
          "Contact Code": "contactCode",
          "Contact Number": "contactNumber",
          Comments: "comments",
          "Submitted At": "submittedAt",
        },
      },
      AI_Consultation: {
        headerMap: {
          "Support Required": "supportRequired",
          "Full Name": "fullName",
          "Current Country": "currentCountry",
          "Consultation Country": "consultationCountry",
          Email: "email",
          "Contact Code": "contactCode",
          "Contact Number": "contactNumber",
          Comments: "comments",
          "Submitted At": "submittedAt",
        },
      },
      AI_Workation: {
        headerMap: {
          "No Of People": "noOfPeople",
          "Full Name": "fullName",
          "Company Name": "companyName",
          "Company Website": "companyWebsite",
          "Current Country": "currentCountry",
          "Workation Country": "workationCountry",
          "Start Date": "startDate",
          "End Date": "endDate",
          Email: "email",
          "Contact Code": "contactCode",
          "Contact Number": "contactNumber",
          Comments: "comments",
          "Submitted At": "submittedAt",
        },
      },
      AI_Become_Contributor: {
        headerMap: {
          "Contribution Type": "contributionType",
          "Full Name": "fullName",
          "Current Country": "currentCountry",
          "LinkedIn Profile": "linkedinProfile",
          Email: "email",
          "Contact Code": "contactCode",
          "Contact Number": "contactNumber",
          Message: "message",
          "Submitted At": "submittedAt",
        },
      },
      Job_Application: {
        headerMap: {
          "Job Position": "jobPosition",
          Name: "name",
          Email: "email",
          "Date of Birth": "dob",
          "Mobile Number": "mobile",
          Location: "location",
          "Experience (in years)": "experienceYears",
          "LinkedIn Profile URL": "linkedin",
          "Current Monthly Salary": "currentMonthlySalary",
          "Expected Monthly Salary": "expectedMonthlySalary",
          "How Soon You Can Join (Days)": "joinInDays",
          "Will You Relocate to Goa (Yes/No)": "relocateGoa",
          "Who are you as a person": "personality",
          "What skill sets do you have for the job that you have applied": "skills",
          "Why should we consider you for joining our company": "whyConsider",
          "Are you willing to bootstrap to join a growing startup": "willingToBootstrap",
          Message: "message",
          "Resume Link": "resumeLink",
          Remarks: "remarks",
          "Submission Date": "submissionDate",
          "Submission Time": "submissionTime",
        },
      },
    };

    var config = sheetConfigs[sheetName];
    if (!config) {
      return jsonResponse({ status: "error", message: "Invalid sheetName" });
    }

    if (!data.submittedAt) {
      data.submittedAt = Utilities.formatDate(
        new Date(),
        Session.getScriptTimeZone(),
        "d MMMM yyyy, h:mm a"
      );
    }

    var sheet = ensureSheet(ss, sheetName, config);

    if (config.rowOrder) {
      var row = config.rowOrder.map(function (key) {
        return data[key] || "";
      });
      row.push(data.submittedAt);
      sheet.appendRow(row);
    } else if (config.headerMap) {
      ensureHeaders(sheet, Object.keys(config.headerMap));
      var headers = getHeaders(sheet);
      var mappedRow = headers.map(function (header) {
        var dataKey = config.headerMap[header];
        if (header.toLowerCase().indexOf("submitted") !== -1) {
          return data.submittedAt;
        }
        return dataKey ? String(data[dataKey] || "") : "";
      });
      sheet.appendRow(mappedRow);
    }

    return jsonResponse({ status: "success" });
  } catch (err) {
    return jsonResponse({ status: "error", message: err.toString() });
  }
}

function ensureSheet(ss, sheetName, config) {
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (config.headerMap) {
      sheet.getRange(1, 1, 1, Object.keys(config.headerMap).length).setValues([
        Object.keys(config.headerMap),
      ]);
    } else if (config.rowOrder) {
      var headers = config.rowOrder.slice();
      headers.push("Submitted At");
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function ensureHeaders(sheet, requiredHeaders) {
  var headers = getHeaders(sheet);

  if (!headers.length) {
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    return;
  }

  requiredHeaders.forEach(function (header) {
    if (headers.indexOf(header) === -1) {
      sheet.getRange(1, headers.length + 1).setValue(header);
      headers.push(header);
    }
  });
}

function getHeaders(sheet) {
  var lastColumn = sheet.getLastColumn();
  if (!lastColumn) {
    return [];
  }
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String);
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
