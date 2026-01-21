# Privacy Policy for IP Guard Extension

**Last Updated:** January 21, 2026

## Introduction

IP Guard ("the Extension") is committed to protecting your privacy. This Privacy Policy explains how we handle information when you use our browser extension.

## Information Collection and Use

### What We DO NOT Collect

IP Guard does **NOT** collect, store, transmit, or share any of the following:

- ❌ Personal information
- ❌ Browsing history
- ❌ Email addresses
- ❌ User accounts or profiles
- ❌ Analytics or tracking data
- ❌ IP addresses or network information
- ❌ Cookies or tracking identifiers
- ❌ Usage statistics
- ❌ Crash reports

### What Data is Stored Locally

The Extension stores the following information **locally on your device only**:

✅ **Target IP Configuration** - The IP addresses, CIDR ranges, or IP ranges you configure as targets
✅ **API Preference** - Your selected IP detection API choice
✅ **Check Interval** - Your configured automatic check frequency
✅ **Last Check Timestamp** - When the extension last checked your IP
✅ **Last Detected IPs** - Your most recently detected IPv4/IPv6 addresses (for display purposes only)

**Important:** All this data is stored using Chrome's local storage API and **never leaves your device**. It is not transmitted to any server, analytics service, or third party.

## External Services

### IP Detection APIs

To detect your public IP address, the Extension makes requests to third-party IP detection services. You can choose which service to use:

- ipify.org
- Cloudflare (1.1.1.1)
- AWS CheckIP (checkip.amazonaws.com)
- ipinfo.io
- ipapi.co
- icanhazip.com
- api.my-ip.io
- api64.ipify.org (for IPv6)

**What these services see:**
- Your public IP address (this is the purpose of the service)
- Standard HTTP request headers

**What we send:** Only standard HTTP requests. No personal information, tracking data, or identifiers.

**Privacy policies of these services:**
- We do not control these third-party services
- We recommend reviewing their privacy policies if concerned
- You can choose which service to use in Advanced Settings

## Permissions

The Extension requires the following permissions:

### Storage Permission
**Purpose:** To save your configuration (target IPs, preferences) locally on your device.
**Data Access:** Only data you explicitly configure in the extension.

### Alarms Permission
**Purpose:** To schedule automatic IP checks at your configured interval.
**Data Access:** No data access, only timing functionality.

### Host Permissions
**Purpose:** To contact IP detection APIs to retrieve your public IP address.
**Hosts:** Limited to the specific IP detection services listed above.

## Data Sharing

We do **NOT** share, sell, trade, or transfer any information to third parties.

The Extension operates entirely locally. Your configuration never leaves your device except for the necessary requests to IP detection APIs (which only see your public IP address, not your configuration).

## Data Security

- All configuration is stored locally using Chrome's secure storage API
- No server-side storage or databases
- No user accounts or authentication
- No network transmission of personal data
- Open source code available for security auditing

## Children's Privacy

IP Guard does not knowingly collect information from anyone, including children under 13. The Extension does not collect any personal information whatsoever.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Any changes will be posted in the Extension's store listing and updated here with a new "Last Updated" date.

## Your Rights

Since we don't collect any personal data:
- There is no data to access, export, or delete from our servers (we have none)
- All your data is already in your control (stored locally in your browser)
- You can uninstall the Extension at any time, which removes all local data

## Contact

If you have questions about this Privacy Policy, please:
- Open an issue on our GitHub repository (if applicable)
- Contact via the support email listed in the store listing
- Review the open-source code for transparency

## Compliance

This Privacy Policy complies with:
- Microsoft Edge Add-ons Store policies
- Chrome Web Store policies
- General Data Protection Regulation (GDPR) principles
- California Consumer Privacy Act (CCPA) principles

## Summary

**In Plain English:**

✅ We don't collect anything  
✅ We don't track you  
✅ Everything stays on your device  
✅ No servers, no databases, no accounts  
✅ Just a simple tool that checks your IP  

**That's it. Your privacy is fully protected.**

---

**Version:** 1.0.0  
**Effective Date:** January 21, 2026  
**Extension:** IP Guard - Network IP Verification & Leak Detection
