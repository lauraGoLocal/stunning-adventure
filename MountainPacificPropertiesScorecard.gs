function main() {
  var spreadsheetUrl = "https://docs.google.com/spreadsheets/d/10jfWGMcVMxDEHqnI1HcB2i6tjxDJKuxRTHCEcJGAyBA/edit?gid=309885843#gid=309885843";
  var sheetName = "Mountain Pacific Properties Google Export";
  
  var spreadsheet = SpreadsheetApp.openByUrl(spreadsheetUrl);
  var sheet = spreadsheet.getSheetByName(sheetName);
  
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }

  var today = new Date();
  var todayString = Utilities.formatDate(today, "America/Chicago", "yyyy-MM-dd");
  Logger.log("Today's date (Chicago timezone): " + todayString);
  
  var currentYear = todayString.substring(0, 4);
  var currentMonth = todayString.substring(5, 7);
  
  var startDate = currentYear + currentMonth + "01";
  var endDate = Utilities.formatDate(today, "America/Chicago", "yyyyMMdd");
  
  var headers = [
    "Campaign", "Cost", "Impr.", "Clicks", "CTR", "Conv. rate", 
    "Conversions", "Search impr", "Search lost IS (rank)", 
    "Search lost IS (budget)", "Reservation", "Rental Click", "Form Submit", "Bid Strategy"
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  var campaignBidStrategies = {};
  var campaignIterator = AdsApp.campaigns()
    .withCondition("Status = ENABLED")
    .get();
  
  Logger.log("Collecting bid strategy information from campaigns...");
  while (campaignIterator.hasNext()) {
    var campaign = campaignIterator.next();
    var campaignName = campaign.getName();
    var bidStrategy = "Unknown";
    
    try {
      if (campaign.getBiddingStrategyType()) {
        bidStrategy = campaign.getBiddingStrategyType();
        Logger.log("Campaign: " + campaignName + ", Direct Bid Strategy: " + bidStrategy);
      }
    } catch (e) {
      Logger.log("Error getting bid strategy for campaign " + campaignName + ": " + e.message);
    }
    
    campaignBidStrategies[campaignName] = bidStrategy;
  }
  
  var campaignQuery = "SELECT CampaignName, Cost, Impressions, Clicks, Ctr, ConversionRate, " +
                     "Conversions, SearchImpressionShare, SearchRankLostImpressionShare, " +
                     "SearchBudgetLostImpressionShare " +
                     "FROM CAMPAIGN_PERFORMANCE_REPORT " +
                     "WHERE CampaignStatus = 'ENABLED' " +
                     "DURING " + startDate + "," + endDate;
  
  Logger.log("Running campaign query with date range: " + startDate + " to " + endDate);
  
  var campaignReport = AdsApp.report(campaignQuery);
  var campaignRows = campaignReport.rows();
  
  var campaignData = {};
  while (campaignRows.hasNext()) {
    var row = campaignRows.next();
    var campaignName = row["CampaignName"];
    
    campaignData[campaignName] = {
      "Cost": row["Cost"],
      "Impressions": row["Impressions"],
      "Clicks": row["Clicks"],
      "Ctr": row["Ctr"],
      "ConversionRate": row["ConversionRate"],
      "Conversions": row["Conversions"],
      "SearchImpressionShare": row["SearchImpressionShare"],
      "SearchRankLostImpressionShare": row["SearchRankLostImpressionShare"],
      "SearchBudgetLostImpressionShare": row["SearchBudgetLostImpressionShare"],
      "BidStrategy": campaignBidStrategies[campaignName] || "Unknown",
      "Reservation": 0, // Default to 0
      "RentalClick": 0,  // Default to 0
      "FormSubmit": 0    // Default to 0
    };
  }
  
  Logger.log("Found " + Object.keys(campaignData).length + " campaigns");
  
  try {
    var bidStratIterator = AdsApp.campaigns()
      .withCondition("Status = ENABLED")
      .forDateRange(startDate, endDate)
      .get();
    
    while (bidStratIterator.hasNext()) {
      var campaign = bidStratIterator.next();
      var campaignName = campaign.getName();
      
      if (campaignData[campaignName]) {
        try {
          var bidStrategy = "Unknown";
          
          if (campaign.getBiddingStrategyType) {
            bidStrategy = campaign.getBiddingStrategyType();
            Logger.log("Campaign: " + campaignName + ", Bid Strategy (Method 1): " + bidStrategy);
          }
          
          if (bidStrategy === "Unknown" && campaign.bidding().getTargetCpa) {
            var targetCpa = campaign.bidding().getTargetCpa();
            if (targetCpa) {
              bidStrategy = "Target CPA: $" + (targetCpa.getMicroAmount() / 1000000);
              Logger.log("Campaign: " + campaignName + ", Bid Strategy (Method 2): " + bidStrategy);
            }
          }
          
          if (bidStrategy === "Unknown" && campaign.bidding().getTargetRoas) {
            var targetRoas = campaign.bidding().getTargetRoas();
            if (targetRoas) {
              bidStrategy = "Target ROAS: " + (targetRoas.getMultiplier() * 100) + "%";
              Logger.log("Campaign: " + campaignName + ", Bid Strategy (Method 3): " + bidStrategy);
            }
          }
          
          if (bidStrategy !== "Unknown") {
            campaignData[campaignName]["BidStrategy"] = bidStrategy;
          }
          
        } catch (e) {
          Logger.log("Error accessing bid strategy for campaign " + campaignName + ": " + e.message);
        }
      }
    }
  } catch (e) {
    Logger.log("Error in alternative bid strategy approach: " + e.message);
  }
  
  var convQuery = "SELECT CampaignName, ConversionTypeName, Conversions " +
                 "FROM CAMPAIGN_PERFORMANCE_REPORT " +
                 "WHERE CampaignStatus = 'ENABLED' " +
                 "DURING " + startDate + "," + endDate;
  
  Logger.log("Running conversion query with same date range");
  
  var convReport = AdsApp.report(convQuery);
  var convRows = convReport.rows();
  
  while (convRows.hasNext()) {
    var row = convRows.next();
    var campaignName = row["CampaignName"];
    var actionName = row["ConversionTypeName"];
    var conversions = row["Conversions"];
    
    if (campaignData[campaignName]) {
      if (actionName && actionName.indexOf("se_reservation") !== -1) {
        campaignData[campaignName]["Reservation"] = conversions;
      } else if (actionName && actionName.indexOf("rent_now_click") !== -1) {
        campaignData[campaignName]["RentalClick"] = conversions;
      } else if (actionName && actionName.indexOf("gli_facility_contact_form") !== -1) {
        campaignData[campaignName]["FormSubmit"] = conversions;
      }
    }
  }
  
  var bidStrategyMap = {
    "MAXIMIZE_CONVERSIONS": "Max Conversions",
    "Maximize Conversions": "Max Conversions",
    "MAXIMIZE_CONVERSION_VALUE": "Max Conversion Value",
    "Maximize Conversion Value": "Max Conversion Value",
    "TARGET_SPEND": "Max Clicks",
    "Maximize Clicks": "Max Clicks",
    "MANUAL_CPC": "Manual CPC",
    "Manual CPC": "Manual CPC",
    "Enhanced CPC": "Manual CPC",
    "ENHANCED_CPC": "Manual CPC",
    "TARGET_IMPRESSION_SHARE": "Target Impression Share",
    "Target Impression Share": "Target Impression Share",
    "TARGET_CPA": "Target CPA",
    "Target CPA": "Target CPA",
    "TARGET_ROAS": "Target ROAS",
    "Target ROAS": "Target ROAS"
  };
  
  var rowNum = 2;
  var allData = [];
  
  for (var campaignName in campaignData) {
    var campaign = campaignData[campaignName];
    var standardizedBidStrategy = campaign["BidStrategy"];
    if (bidStrategyMap[standardizedBidStrategy]) {
      standardizedBidStrategy = bidStrategyMap[standardizedBidStrategy];
    } else if (standardizedBidStrategy.startsWith("Target CPA:")) {
      standardizedBidStrategy = "Target CPA";
    } else if (standardizedBidStrategy.startsWith("Target ROAS:")) {
      standardizedBidStrategy = "Target ROAS";
    } else if (standardizedBidStrategy === "Trojan Storage Portfolio") {
      standardizedBidStrategy = "Max Conversions";
    }
    
    allData.push([
      campaignName,
      campaign["Cost"],
      campaign["Impressions"],
      campaign["Clicks"],
      campaign["Ctr"],
      campaign["ConversionRate"],
      campaign["Conversions"],
      campaign["SearchImpressionShare"],
      campaign["SearchRankLostImpressionShare"],
      campaign["SearchBudgetLostImpressionShare"],
      campaign["Reservation"],
      campaign["RentalClick"],
      campaign["FormSubmit"],
      standardizedBidStrategy
    ]);
  }
  
  if (allData.length > 0) {
    sheet.getRange(rowNum, 1, allData.length, headers.length).setValues(allData);
  }
  
  Logger.log("Data successfully exported to Google Sheet");
}
