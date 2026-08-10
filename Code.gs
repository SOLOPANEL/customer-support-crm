
// URL looks like: https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
var SHEET_ID = "13BRh8C1DukHhs9yGMBZFFgys3LAWN5xeBHa7qRfn06g";

var SHEETS = {
  TICKETS: "Tickets",
  ORDERS: "Orders",
  TEAM: "Team"
};


function doGet() {
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("Support CRM — Datastraw")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}


/**
 * Get a specific sheet by name
 */
function getSheet(sheetName) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet not found: " + sheetName);
  return sheet;
}

/**
 * Get all data from a sheet as array of objects
 * Row 1 is treated as headers
 */
function getSheetData(sheetName) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  if (!data || data.length < 2) return [];

  var headers = data[0];
  var rows = [];

  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      var val = data[i][j];
      // Convert Date objects to string
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
      }
      row[headers[j]] = val;
    }
    // Only add non-empty rows
    if (row[headers[0]]) rows.push(row);
  }
  return rows;
}

/**
 * Generate a unique Ticket ID like TKT-00042
 */
function generateTicketId() {
  var sheet = getSheet(SHEETS.TICKETS);
  var lastRow = sheet.getLastRow();
  var num = lastRow; // Row 1 is header, so row 2 = ticket 1
  return "TKT-" + String(num).padStart(5, "0");
}

/**
 * Format a date to readable string
 */
function formatDate(date) {
  if (!date) return "";
  var d = new Date(date);
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
}

/**
 * Find a ticket's row index by TicketID (returns 1-based row number)
 */
function findTicketRow(ticketId) {
  var sheet = getSheet(SHEETS.TICKETS);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === ticketId) return i + 1; // 1-based
  }
  return -1;
}

function setupSheets() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // ---- Tickets Sheet ----
  var ticketHeaders = [
    "TicketID", "CustomerName", "Email", "Phone", "Channel",
    "Status", "EscalationLevel", "AssignedTo", "QueryTheme",
    "ActionTaken", "IssueDescription", "OrderID",
    "CreatedAt", "UpdatedAt", "ResolutionNotes", "ChatTranscript"
  ];
  var tSheet = ss.getSheetByName(SHEETS.TICKETS) || ss.insertSheet(SHEETS.TICKETS);
  if (tSheet.getLastRow() === 0) {
    tSheet.appendRow(ticketHeaders);
    tSheet.getRange(1, 1, 1, ticketHeaders.length).setFontWeight("bold").setBackground("#1a73e8").setFontColor("#ffffff");
  }

  // ---- Orders Sheet ----
  var orderHeaders = [
    "OrderID", "CustomerName", "Product", "Amount", "OrderDate", "OrderStatus", "CustomerEmail"
  ];
  var oSheet = ss.getSheetByName(SHEETS.ORDERS) || ss.insertSheet(SHEETS.ORDERS);
  if (oSheet.getLastRow() === 0) {
    oSheet.appendRow(orderHeaders);
    oSheet.getRange(1, 1, 1, orderHeaders.length).setFontWeight("bold").setBackground("#1a73e8").setFontColor("#ffffff");

    // Add sample orders
    var sampleOrders = [
      ["ORD-001", "Rahul Sharma", "Nike Air Max", 4999, "2025-01-15", "Delivered", "rahul@gmail.com"],
      ["ORD-002", "Priya Patel", "Samsung TV", 35000, "2025-01-18", "Shipped", "priya@gmail.com"],
      ["ORD-003", "Amit Verma", "Apple AirPods", 15000, "2025-01-20", "Processing", "amit@gmail.com"],
      ["ORD-004", "Sneha Roy", "Laptop Stand", 1500, "2025-01-22", "Cancelled", "sneha@gmail.com"],
      ["ORD-005", "Karan Singh", "Wireless Mouse", 899, "2025-01-25", "Delivered", "karan@gmail.com"]
    ];
    for (var i = 0; i < sampleOrders.length; i++) {
      oSheet.appendRow(sampleOrders[i]);
    }
  }

  // ---- Team Sheet ----
  var teamHeaders = ["MemberID", "Name", "Department", "Email"];
  var teamSheet = ss.getSheetByName(SHEETS.TEAM) || ss.insertSheet(SHEETS.TEAM);
  if (teamSheet.getLastRow() === 0) {
    teamSheet.appendRow(teamHeaders);
    teamSheet.getRange(1, 1, 1, teamHeaders.length).setFontWeight("bold").setBackground("#1a73e8").setFontColor("#ffffff");

    // Add sample team members
    var sampleTeam = [
      ["TM-001", "Ankit Mehta", "Tier 1 Support", "ankit@datastraw.in"],
      ["TM-002", "Divya Nair", "Tier 2 Support", "divya@datastraw.in"],
      ["TM-003", "Rohan Das", "Technical", "rohan@datastraw.in"],
      ["TM-004", "Meera Joshi", "Billing", "meera@datastraw.in"],
      ["TM-005", "Suresh Kumar", "Escalations", "suresh@datastraw.in"]
    ];
    for (var j = 0; j < sampleTeam.length; j++) {
      teamSheet.appendRow(sampleTeam[j]);
    }
  }

  return { success: true, message: "Sheets set up successfully!" };
}

/**
 * CREATE a new ticket
 * Called from frontend when user submits the New Ticket form
 */
function createTicket(data) {
  try {
    var sheet = getSheet(SHEETS.TICKETS);
    var ticketId = generateTicketId();
    var now = formatDate(new Date());

    var row = [
      ticketId,
      data.customerName || "",
      data.email || "",
      data.phone || "",
      data.channel || "Email",
      data.status || "Pending",
      data.escalationLevel || "None",
      data.assignedTo || "",
      data.queryTheme || "",
      data.actionTaken || "",
      data.issueDescription || "",
      data.orderId || "",
      now,        // CreatedAt
      now,        // UpdatedAt
      "",         // ResolutionNotes
      ""          // ChatTranscript
    ];

    sheet.appendRow(row);

    return {
      success: true,
      ticketId: ticketId,
      message: "Ticket created successfully!"
    };
  } catch (e) {
    return { success: false, message: "Error creating ticket: " + e.message };
  }
}

/**
 * GET all tickets
 * Returns all rows from Tickets sheet as array of objects
 */
function getAllTickets() {
  try {
    var tickets = getSheetData(SHEETS.TICKETS) || [];
    Logger.log('Tickets found: ' + tickets.length);
    return { success: true, data: tickets };
  } catch (e) {
    Logger.log('Error: ' + e.message);
    return { success: false, message: e.message, data: [] };
  }
}

/**
 * GET a single ticket by TicketID
 */
function getTicketById(ticketId) {
  try {
    var tickets = getSheetData(SHEETS.TICKETS);
    var ticket = tickets.find(function(t) { return t.TicketID === ticketId; });
    if (!ticket) return { success: false, message: "Ticket not found" };
    return { success: true, data: ticket };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * UPDATE an existing ticket
 * data must include TicketID
 */
function updateTicket(ticketId, data) {
  try {
    var sheet = getSheet(SHEETS.TICKETS);
    var rowIndex = findTicketRow(ticketId);
    if (rowIndex === -1) return { success: false, message: "Ticket not found: " + ticketId };

    // Column mapping (1-based)
    var colMap = {
      CustomerName: 2, Email: 3, Phone: 4, Channel: 5,
      Status: 6, EscalationLevel: 7, AssignedTo: 8,
      QueryTheme: 9, ActionTaken: 10, IssueDescription: 11,
      OrderID: 12, UpdatedAt: 14, ResolutionNotes: 15, ChatTranscript: 16
    };

    // Update provided fields
    for (var key in data) {
      if (colMap[key]) {
        sheet.getRange(rowIndex, colMap[key]).setValue(data[key]);
      }
    }

    // Always update UpdatedAt timestamp
    sheet.getRange(rowIndex, colMap.UpdatedAt).setValue(formatDate(new Date()));

    return { success: true, message: "Ticket updated successfully!" };
  } catch (e) {
    return { success: false, message: "Error updating ticket: " + e.message };
  }
}

/**
 * UPDATE only the status of a ticket (quick action)
 */
function updateTicketStatus(ticketId, newStatus) {
  return updateTicket(ticketId, { Status: newStatus });
}

/**
 * SEARCH tickets
 * Searches across TicketID, CustomerName, Email, Phone, OrderID
 */
function searchTickets(query) {
  try {
    if (!query || query.trim() === "") return getAllTickets();

    var tickets = getSheetData(SHEETS.TICKETS);
    var q = query.toLowerCase().trim();

    var results = tickets.filter(function(t) {
      return (
        String(t.TicketID).toLowerCase().includes(q) ||
        String(t.CustomerName).toLowerCase().includes(q) ||
        String(t.Email).toLowerCase().includes(q) ||
        String(t.Phone).toLowerCase().includes(q) ||
        String(t.OrderID).toLowerCase().includes(q)
      );
    });

    return { success: true, data: results };
  } catch (e) {
    return { success: false, message: e.message, data: [] };
  }
}

/**
 * FILTER tickets by multiple criteria
 * filters = { status, channel, escalationLevel, dateFrom, dateTo }
 */
function filterTickets(filters) {
  try {
    var tickets = getSheetData(SHEETS.TICKETS);

    var results = tickets.filter(function(t) {
      // Filter by status
      if (filters.status && filters.status !== "All") {
        if (t.Status !== filters.status) return false;
      }

      // Filter by channel
      if (filters.channel && filters.channel !== "All") {
        if (t.Channel !== filters.channel) return false;
      }

      // Filter by escalation level
      if (filters.escalationLevel && filters.escalationLevel !== "All") {
        if (t.EscalationLevel !== filters.escalationLevel) return false;
      }

      // Filter by date range
      if (filters.dateFrom) {
        var from = new Date(filters.dateFrom);
        var created = new Date(t.CreatedAt);
        if (created < from) return false;
      }
      if (filters.dateTo) {
        var to = new Date(filters.dateTo);
        to.setHours(23, 59, 59); // End of day
        var createdTo = new Date(t.CreatedAt);
        if (createdTo > to) return false;
      }

      return true;
    });

    return { success: true, data: results };
  } catch (e) {
    return { success: false, message: e.message, data: [] };
  }
}

/**
 * GET active tickets only (not Resolved)
 */
function getActiveTickets() {
  return filterTickets({ status: "" }); // Will be filtered below
  // Actually let's do it properly:
}
function getActiveTicketsOnly() {
  try {
    var tickets = getSheetData(SHEETS.TICKETS);
    var results = tickets.filter(function(t) {
      return t.Status !== "Resolved";
    });
    return { success: true, data: results };
  } catch (e) {
    return { success: false, message: e.message, data: [] };
  }
}

/**
 * GET tickets grouped by assigned team member
 */
function getTicketsByTeam() {
  try {
    var tickets = getSheetData(SHEETS.TICKETS);
    var grouped = {};

    tickets.forEach(function(t) {
      var member = t.AssignedTo || "Unassigned";
      if (!grouped[member]) grouped[member] = [];
      grouped[member].push(t);
    });

    return { success: true, data: grouped };
  } catch (e) {
    return { success: false, message: e.message, data: {} };
  }
}


/**
 * GET all orders
 */
function getAllOrders() {
  try {
    var orders = getSheetData(SHEETS.ORDERS);
    return { success: true, data: orders };
  } catch (e) {
    return { success: false, message: e.message, data: [] };
  }
}

/**
 * GET a single order by OrderID
 */
function getOrderById(orderId) {
  try {
    var orders = getSheetData(SHEETS.ORDERS);
    var order = orders.find(function(o) { return o.OrderID === orderId; });
    if (!order) return { success: false, message: "Order not found" };
    return { success: true, data: order };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * GET all team members
 */
function getTeamMembers() {
  try {
    var team = getSheetData(SHEETS.TEAM);
    return { success: true, data: team };
  } catch (e) {
    return { success: false, message: e.message, data: [] };
  }
}

/**
 * GET summary stats for dashboard
 */
function getDashboardStats() {
  try {
    var tickets = getSheetData(SHEETS.TICKETS);
    var total = tickets.length;
    var pending = tickets.filter(function(t) { return t.Status === "Pending"; }).length;
    var inProgress = tickets.filter(function(t) { return t.Status === "In Progress"; }).length;
    var resolved = tickets.filter(function(t) { return t.Status === "Resolved"; }).length;
    var waitingCustomer = tickets.filter(function(t) { return t.Status === "Waiting on Customer"; }).length;
    var waitingThird = tickets.filter(function(t) { return t.Status === "Waiting on Third Party"; }).length;

    // Tickets by channel
    var channels = {};
    tickets.forEach(function(t) {
      var ch = t.Channel || "Unknown";
      channels[ch] = (channels[ch] || 0) + 1;
    });

    // Tickets by escalation
    var escalations = {};
    tickets.forEach(function(t) {
      var esc = t.EscalationLevel || "None";
      escalations[esc] = (escalations[esc] || 0) + 1;
    });

    // Recent tickets (last 5)
    var recent = tickets.slice(-5).reverse();

    return {
      success: true,
      data: {
        total: total,
        pending: pending,
        inProgress: inProgress,
        resolved: resolved,
        waitingCustomer: waitingCustomer,
        waitingThird: waitingThird,
        channels: channels,
        escalations: escalations,
        recent: recent
      }
    };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * EXPORT all tickets as CSV string
 */
function exportTicketsCSV() {
  try {
    var sheet = getSheet(SHEETS.TICKETS);
    var data = sheet.getDataRange().getValues();
    var csv = data.map(function(row) {
      return row.map(function(cell) {
        var val = String(cell).replace(/"/g, '""');
        return '"' + val + '"';
      }).join(",");
    }).join("\n");

    return { success: true, csv: csv };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function deleteTicket(ticketId) {
  try {
    var sheet = getSheet(SHEETS.TICKETS);
    var rowIndex = findTicketRow(ticketId);
    if (rowIndex === -1) return { success: false, message: "Ticket not found" };
    sheet.deleteRow(rowIndex);
    return { success: true, message: "Ticket deleted." };
  } catch (e) {
    return { success: false, message: e.message };
  }
}
