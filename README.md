# Google Ads Data Export Scripts - README

## Overview
This collection of scripts automatically extracts performance data from Google Ads campaigns and exports it to specified Google Sheets. The scripts run on a schedule through Google Ads Scripts to provide up-to-date performance metrics for multiple storage facility management companies.

## Purpose
These scripts help storage facility managers and paid media specialists track campaign performance by:
- Gathering current month campaign metrics (cost, impressions, clicks, CTR, etc.)
- Collecting conversion data for specific actions (reservations, rental clicks, form submissions)
- Retrieving and standardizing bid strategy information
- Organizing all data into structured Google Sheets for analysis and reporting

## Target Spreadsheets
The scripts in this repository update the following Google Sheets:
1. [Trojan Storage Scorecard](https://docs.google.com/spreadsheets/d/17tmy7-S-rIPCL56WhVnJ0j7X82_2Q-FTEB9P0z9obEI/edit?gid=1431996339#gid=1431996339)
2. [Multiple Storage Companies Scorecard](https://docs.google.com/spreadsheets/d/10jfWGMcVMxDEHqnI1HcB2i6tjxDJKuxRTHCEcJGAyBA/edit?gid=2102524254#gid=2102524254)

## Script Variants
The repository contains four script variants, each targeting different companies/sheets:

### 1. Trojan Storage Script
- Updates the "Google Export" sheet in the Trojan Storage spreadsheet
- Tracks standard metrics plus "Reservation" and "Rental Click" conversions

### 2. Tierra Corp Script
- Updates the "Tierra Corp Google Export" sheet
- Tracks standard metrics plus "Reservation", "Rental Click", and "Form Submit" conversions

### 3. Southwest Self Storage Script
- Updates the "Southwest Self Storage Google Export" sheet
- Tracks standard metrics plus "Reservation", "Rental Click", and "Form Submit" conversions

### 4. Mountain Pacific Properties Script
- Updates the "Mountain Pacific Properties Google Export" sheet
- Tracks standard metrics plus "Reservation", "Rental Click", and "Form Submit" conversions

## Data Collection
The scripts collect the following data for each enabled campaign:
- Campaign name
- Cost
- Impressions
- Clicks
- Click-through rate (CTR)
- Conversion rate
- Total conversions
- Search impression share
- Lost impression share (rank)
- Lost impression share (budget)
- Specific conversion actions (reservations, rental clicks, form submissions)
- Bid strategy

## Functionality
1. Clears existing data in the target sheet (preserving headers)
2. Calculates date range (1st of current month to current date)
3. Collects bid strategy information for all enabled campaigns
4. Retrieves campaign performance metrics using the Google Ads API
5. Processes and categorizes conversion data by type
6. Standardizes bid strategy names for consistency
7. Exports all data to the specified Google Sheet

## Bid Strategy Standardization
The scripts standardize various bid strategy formats to consistent naming:
- "MAXIMIZE_CONVERSIONS" → "Max Conversions"
- "TARGET_SPEND" → "Max Clicks"
- "MANUAL_CPC" or "ENHANCED_CPC" → "Manual CPC"
- "TARGET_IMPRESSION_SHARE" → "Target Impression Share"
- "TARGET_CPA" → "Target CPA"
- "TARGET_ROAS" → "Target ROAS"

## Setup Instructions
1. Access Google Ads Scripts from your Google Ads account
2. Create a new script and paste the appropriate code version
3. Update the spreadsheet URL and sheet name if necessary
4. Authorize the script to access your Google Ads account and Google Sheets
5. Test the script using the Preview button
6. Schedule the script to run automatically (daily or weekly recommended)

## Requirements
- Active Google Ads account with administrative access
- Permission to access the target Google Sheets
- Enabled conversion tracking in Google Ads
- Properly configured campaigns with standard naming conventions

## Troubleshooting
If the script fails to run:
- Check Google Ads account permissions
- Verify Google Sheets access and URLs
- Review logs for specific error messages
- Ensure conversion tracking is properly set up in Google Ads
- Confirm that campaign naming conventions match expected patterns

For help with troubleshooting or modifying these scripts, you can utilize AI assistance.

## AI Assistance for Script Modifications

### Sample Prompt Template

```
I need help with the Google Ads export script for [COMPANY NAME]. Here's what I'm trying to do:

[DESCRIBE YOUR GOAL]

Here's the current code:
```
[PASTE RELEVANT CODE SECTION]
```

The specific issue I'm encountering is:
[DESCRIBE THE ERROR OR DESIRED MODIFICATION]

Can you help me modify this script to [DESIRED OUTCOME]?
```

Examples of tasks you might request help with:
- Adding new conversion metrics to track
- Modifying the date range for data collection
- Adding custom filters for specific campaigns
- Creating new report formats or calculated fields
- Troubleshooting error messages or unexpected results
